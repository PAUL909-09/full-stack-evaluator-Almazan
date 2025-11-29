// backend/src/Models/Evaluation.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace task_manager_api.Models
{
    public class Evaluation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid TaskId { get; set; }

        // EF navigation - null! is correct here
        public TaskItem Task { get; set; } = null!;

        [Required]
        public Guid EvaluatorId { get; set; }

        // EF navigation - null! is correct here
        public User Evaluator { get; set; } = null!;

        [Required]
        public EvaluationStatus Status { get; set; } = EvaluationStatus.Pending;

        [MaxLength(1000)]
        public string Comments { get; set; } = string.Empty;

        public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum EvaluationStatus
    {
        Pending,
        Approved,
        NeedsRevision,
        Rejected
    }
}
