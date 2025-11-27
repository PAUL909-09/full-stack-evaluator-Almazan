using task_manager_api.DTOs.Evaluation;   // ← ADD THIS USING
using task_manager_api.Models;

namespace task_manager_api.Services
{
    public interface IEvaluationService
    {
        Task<Evaluation?> GetEvaluationByTaskId(Guid taskId);
        Task CreateEvaluation(Evaluation evaluation);
        Task UpdateEvaluation(Evaluation evaluation);
        Task DeleteEvaluation(Guid taskId);
        Task<IEnumerable<TaskItem>> GetPendingTasks();

        // ← REPLACED the old return type with the DTO version
        // In IEvaluationService.cs
        Task<IReadOnlyList<EvaluationHistoryDto>> GetEvaluationHistoryByEvaluator(Guid evaluatorId);
    }
}