namespace task_manager_api.DTOs.Evaluation
{
    public class EvaluationHistoryDto
    {
        public Guid EvaluationId { get; set; }
        public Guid TaskId { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public string? TaskDescription { get; set; }
        
        public string Status { get; set; } = string.Empty; // "Approved", "NeedsRevision", etc.
        public string? Comments { get; set; }
        public DateTime EvaluatedAt { get; set; }

        // Optional: Evaluator name if you want to show who did it (it's you, but still nice)
        public string EvaluatorName { get; set; } = string.Empty;
    }
}