using System;
using System.ComponentModel.DataAnnotations;

namespace task_manager_api.Models
{
    public class Comment
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid TaskItemId { get; set; }
        public TaskItem TaskItem { get; set; } = null!;
    }
}
