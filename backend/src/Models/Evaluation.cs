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
        public TaskItem Task { get; set; } = null!;

        [Required]
        public Guid EvaluatorId { get; set; }
        public User Evaluator { get; set; } = null!;

        [Required]
        public EvaluationStatus Status { get; set; } = EvaluationStatus.Pending;

        [MaxLength(1000)]
        public string Comments { get; set; } = string.Empty;

        public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
    }

    // keep this file for the enum, or move to a shared enums file
    public enum EvaluationStatus
    {
        Pending,
        Approved,
        NeedsRevision,
        Rejected
    }
}
