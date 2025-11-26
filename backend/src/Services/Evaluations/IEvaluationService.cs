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
    }
}
