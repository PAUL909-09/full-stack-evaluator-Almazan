using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.DTOs.Evaluation;
using task_manager_api.Models;
using TaskStatus = task_manager_api.Models.TaskStatus;

namespace task_manager_api.Services
{
    public class EvaluationService : IEvaluationService
    {
        private readonly ApplicationDbContext _db;

        public EvaluationService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<Evaluation?> GetEvaluationByTaskId(Guid taskId)
        {
            return await _db.Evaluations
                .Include(e => e.Evaluator)
                .Include(e => e.Task)
                .FirstOrDefaultAsync(e => e.TaskId == taskId);
        }

        // NEW: Smart upsert — creates OR updates evaluation (prevents duplicates)
        public async Task UpsertEvaluation(Evaluation evaluation)
        {
            var existing = await _db.Evaluations
                .FirstOrDefaultAsync(e => e.TaskId == evaluation.TaskId);

            if (existing != null)
            {
                // UPDATE existing evaluation
                existing.Status = evaluation.Status;
                existing.Comments = evaluation.Comments;
                existing.EvaluatedAt = DateTime.UtcNow;
            }
            else
            {
                // CREATE new evaluation
                evaluation.EvaluatedAt = DateTime.UtcNow;
                _db.Evaluations.Add(evaluation);
                existing = evaluation; // for history log below
            }

            // Update task status based on evaluation
            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == evaluation.TaskId);
            if (task != null)
            {
                ApplyEvaluationToTask(task, evaluation.Status);
            }

            // Log to history
            _db.TaskHistories.Add(new TaskHistory
            {
                TaskId = evaluation.TaskId,
                Action = existing == evaluation
                    ? $"Evaluation created: {evaluation.Status}"
                    : $"Evaluation updated: {evaluation.Status}",
                Comments = evaluation.Comments,
                PerformedById = evaluation.EvaluatorId,
                PerformedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
        }

        public async Task DeleteEvaluation(Guid taskId)
        {
            var evaluation = await _db.Evaluations.FirstOrDefaultAsync(e => e.TaskId == taskId);
            if (evaluation == null) throw new ArgumentException("Evaluation not found.");

            _db.Evaluations.Remove(evaluation);

            _db.TaskHistories.Add(new TaskHistory
            {
                TaskId = taskId,
                Action = "Evaluation deleted",
                PerformedById = evaluation.EvaluatorId,
                PerformedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<TaskItem>> GetPendingTasks()
        {
            return await _db.Tasks
                .Include(t => t.AssignedTo)
                .Include(t => t.Project)
                .Include(t => t.History)
                    .ThenInclude(h => h.PerformedBy)
                .Where(t =>
                    t.Status == TaskStatus.Submitted &&
                    (t.Evaluation == null ||                                   // never evaluated
                     !new[] { EvaluationStatus.Approved, EvaluationStatus.Rejected }
                         .Contains(t.Evaluation.Status))                        // or not finally decided
                )
                .ToListAsync();
        }

        public async Task<IEnumerable<EvaluationHistoryDto>> GetEvaluationHistoryByEvaluator(Guid evaluatorId)
        {
            return await _db.Evaluations
                .Where(e => e.EvaluatorId == evaluatorId)
                .OrderByDescending(e => e.EvaluatedAt)
                .Select(e => new EvaluationHistoryDto
                {
                    EvaluationId = e.Id,
                    TaskId = e.TaskId,
                    TaskTitle = e.Task.Title ?? "Untitled Task",
                    TaskDescription = e.Task.Description ?? "No description",
                    Status = e.Status.ToString(),
                    Comments = e.Comments ?? "(No comments)",
                    EvaluatedAt = e.EvaluatedAt,
                    EvaluatorName = e.Evaluator.Name ?? "Unknown"
                })
                .ToListAsync();
        }

        // Handles status changes + re-opening tasks on "NeedsRevision"
        private void ApplyEvaluationToTask(TaskItem task, EvaluationStatus status)
        {
            task.Status = status switch
            {
                EvaluationStatus.Approved => TaskStatus.Approved,
                EvaluationStatus.Rejected => TaskStatus.Rejected,
                EvaluationStatus.NeedsRevision => TaskStatus.InProgress, // ← Re-open for employee
                _ => task.Status
            };

            // Clear submission when sending back for revision
            if (status == EvaluationStatus.NeedsRevision)
            {
                task.SubmittedAt = null;
                task.ProofFilePath = null; // optional: let employee re-upload
            }
        }
    }
}