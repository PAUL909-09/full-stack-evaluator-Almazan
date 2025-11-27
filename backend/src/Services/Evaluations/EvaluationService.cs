using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using TaskStatus = task_manager_api.Models.TaskStatus;
using task_manager_api.DTOs.Evaluation;

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
                .FirstOrDefaultAsync(e => e.TaskId == taskId);
        }

        public async Task CreateEvaluation(Evaluation evaluation)
        {
            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == evaluation.TaskId);
            if (task == null) throw new ArgumentException("Task not found.");

            ApplyEvaluationToTask(task, evaluation.Status);
            _db.Evaluations.Add(evaluation);

            _db.TaskHistories.Add(new TaskHistory
            {
                TaskId = evaluation.TaskId,
                Action = $"Evaluation set to {evaluation.Status}",
                Comments = evaluation.Comments,
                PerformedById = evaluation.EvaluatorId,
                PerformedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
        }

        public async Task UpdateEvaluation(Evaluation evaluation)
        {
            var existingEval = await _db.Evaluations.FirstOrDefaultAsync(e => e.TaskId == evaluation.TaskId);
            if (existingEval == null) throw new ArgumentException("Evaluation not found.");

            existingEval.Status = evaluation.Status;
            existingEval.Comments = evaluation.Comments;
            existingEval.EvaluatedAt = DateTime.UtcNow;

            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == evaluation.TaskId);
            if (task != null)
            {
                ApplyEvaluationToTask(task, evaluation.Status);
            }

            _db.TaskHistories.Add(new TaskHistory
            {
                TaskId = evaluation.TaskId,
                Action = $"Evaluation updated to {evaluation.Status}",
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
                .Include(t => t.History)
                    .ThenInclude(h => h.PerformedBy)
                .Where(t => t.Status == TaskStatus.Submitted
                    && !_db.Evaluations.Any(e => e.TaskId == t.Id))
                .ToListAsync();
        }
        public async Task<IEnumerable<EvaluationHistoryDto>> GetEvaluationHistoryByEvaluator(Guid evaluatorId)
        {
            var history = await _db.Evaluations
                .Where(e => e.EvaluatorId == evaluatorId)
                .OrderByDescending(e => e.EvaluatedAt)
                .Select(e => new EvaluationHistoryDto
                {
                    EvaluationId = e.Id,
                    TaskId = e.TaskId,
                    TaskTitle = e.Task.Title ?? "Untitled Task",
                    TaskDescription = e.Task.Description ?? "No description provided",
                    Status = e.Status.ToString(),
                    Comments = e.Comments ?? "(No comments)",
                    EvaluatedAt = e.EvaluatedAt,
                    EvaluatorName = e.Evaluator.Name ?? "Unknown Evaluator"
                })
                .ToListAsync();

            // DEBUG: Remove this in production — but keep for exam!
            if (!history.Any())
            {
                // This helps you SEE if the query is working
                Console.WriteLine($"[DEBUG] No evaluations found for evaluator ID: {evaluatorId}");
            }

            return history;
        }



        private void ApplyEvaluationToTask(TaskItem task, EvaluationStatus status)
        {
            task.Status = status switch
            {
                EvaluationStatus.Approved => TaskStatus.Approved,
                EvaluationStatus.NeedsRevision => TaskStatus.NeedsRevision,
                EvaluationStatus.Rejected => TaskStatus.Rejected,
                EvaluationStatus.Pending => TaskStatus.Submitted,
                _ => task.Status
            };
        }

        Task<IReadOnlyList<EvaluationHistoryDto>> IEvaluationService.GetEvaluationHistoryByEvaluator(Guid evaluatorId)
        {
            throw new NotImplementedException();
        }
    }
}
