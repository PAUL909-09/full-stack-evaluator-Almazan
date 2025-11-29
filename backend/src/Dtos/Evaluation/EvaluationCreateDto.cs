using System.ComponentModel.DataAnnotations;  // Added for [Required]
using task_manager_api.Models;

namespace task_manager_api.DTOs.Evaluation
{
    public class EvaluationCreateDto
    {
        [Required]  // Ensures TaskId is provided in the request body; triggers 400 Bad Request if missing
        public Guid TaskId { get; set; }
        public EvaluationStatus Status { get; set; }
        public string? Comments { get; set; }
    }
}