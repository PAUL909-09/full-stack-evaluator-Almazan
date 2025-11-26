using task_manager_api.Models;

namespace task_manager_api.DTOs.Evaluation
{
    public class EvaluationCreateDto
    {
        public Guid TaskId { get; set; }
        public EvaluationStatus Status { get; set; }
        public string? Comments { get; set; }
    }
}
