using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace task_manager_api.Models
{
    public enum TaskStatus
    {
        Todo,
        InProgress,
        Done,

        // New evaluator-related statuses
        Approved,
        NeedsRevision,
        Rejected,
        Submitted,
    }


    public class TaskItem
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public TaskStatus Status { get; set; } = TaskStatus.Todo;

        // Foreign Keys
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public Guid CreatedById { get; set; }   // Evaluator
        public User CreatedBy { get; set; } = null!;

        public Guid AssignedToId { get; set; }  // Employee
        public User AssignedTo { get; set; } = null!;

        // Relationships
        public List<Comment> Comments { get; set; } = new();
        public Evaluation? Evaluation { get; set; }  // One-to-one
        public ICollection<TaskHistory> History { get; set; } = new List<TaskHistory>(); // One-to-many

        public DateTime? SubmittedAt { get; set; }  // Nullable, set only on submission
        public string? ProofFilePath { get; set; }   // Path to the uploaded file   
    }
}
