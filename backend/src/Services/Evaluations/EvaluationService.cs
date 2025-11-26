using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
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
                .Where(t => t.Status == TaskStatus.Submitted && !_db.Evaluations.Any(e => e.TaskId == t.Id))  // ✅ Exclude tasks with evaluations
                .ToListAsync();
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
    }
}
