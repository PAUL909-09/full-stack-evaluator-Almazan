using System;

namespace task_manager_api.Models
{
    public class Evaluation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TaskId { get; set; }
        public TaskItem Task { get; set; } = null!;
        public Guid EvaluatorId { get; set; }
        public User Evaluator { get; set; } = null!;
        public decimal Score { get; set; }
        public string Comments { get; set; } = string.Empty;
        public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
    }
}