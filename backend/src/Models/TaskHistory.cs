using System;
using System.ComponentModel.DataAnnotations;

namespace task_manager_api.Models
{
    public class TaskHistory
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid? TaskId { get; set; } 
        public TaskItem? Task { get; set; } 

        [Required]
        public string Action { get; set; } = string.Empty; 

        [MaxLength(1000)]
        public string? Comments { get; set; }


        [Required]
        public Guid PerformedById { get; set; }
        public User PerformedBy { get; set; } = null!;

        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    }
}
