namespace task_manager_api.Dtos.Employee
{
    public class TaskEvaluationDto
    {
        public string Status { get; set; } = "";
        public string? Comments { get; set; }
        public DateTime EvaluatedAt { get; set; }
    }
}
