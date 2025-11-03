using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace task_manager_api.Models
{
    public enum TaskStatus { Todo, InProgress, Done }

    public class TaskItem
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public TaskStatus Status { get; set; } = TaskStatus.Todo;

        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public Guid CreatedById { get; set; }   // Evaluator
        public User CreatedBy { get; set; } = null!;

        public Guid AssignedToId { get; set; }  // Employee
        public User AssignedTo { get; set; } = null!;

        public List<Comment> Comments { get; set; } = new();
        public Evaluation? Evaluation { get; set; }    // optional 1-1 relation
    }
}
