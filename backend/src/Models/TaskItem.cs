using System;

namespace task_manager_api.Models
{
    public enum TaskStatus { Pending, InProgress, Completed }

    public class TaskItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();     // Guid to match User.Id
        public string Title { get; set; } = string.Empty;
        public bool IsDone { get; set; }                  // keep legacy flag
        public TaskStatus Status { get; set; } = TaskStatus.Pending;
        public decimal Score { get; set; }                // for evaluations
        public Guid? AssignedTo { get; set; }             // FK to User (nullable)
        public User? AssignedUser { get; set; }           // navigation
    }
}