using task_manager_api.DTOs.Evaluation;
using task_manager_api.Models;

namespace task_manager_api.Services
{
    // backend/src/Services/IEvaluationService.cs
    public interface IEvaluationService
    {
        Task<Evaluation?> GetEvaluationByTaskId(Guid taskId);
        Task UpsertEvaluation(Evaluation evaluation);  // ← NEW
        Task DeleteEvaluation(Guid taskId);
        Task<IEnumerable<TaskItem>> GetPendingTasks();
        Task<IEnumerable<EvaluationHistoryDto>> GetEvaluationHistoryByEvaluator(Guid evaluatorId);
    }
}
