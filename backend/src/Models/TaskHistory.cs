using System;
using System.ComponentModel.DataAnnotations;

namespace task_manager_api.Models
{
    public class TaskHistory
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid? TaskId { get; set; } // Changed to nullable, removed [Required]
        public TaskItem? Task { get; set; } // Changed to nullableTaskItem

        [Required]
        public string Action { get; set; } = string.Empty; // e.g., "Created", "Approved", "NeedsRevision", "Rejected"

        [MaxLength(1000)]
        public string? Comments { get; set; }


        [Required]
        public Guid PerformedById { get; set; }
        public User PerformedBy { get; set; } = null!;

        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    }
}
