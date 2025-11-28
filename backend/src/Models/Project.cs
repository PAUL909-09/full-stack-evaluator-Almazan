using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace task_manager_api.Models
{
    public class Project
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();

        [Required] public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string Status { get; set; } = "Pending";

        [JsonPropertyName("deadline")]
        public DateTime? Deadline { get; set; }  // ← CLEAN & WORKING

        public Guid EvaluatorId { get; set; }
        public User Evaluator { get; set; } = null!;

        public List<TaskItem> Tasks { get; set; } = new();
        public List<ProjectAssignment> AssignedEmployees { get; set; } = new();
    }
}