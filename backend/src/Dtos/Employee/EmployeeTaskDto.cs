namespace task_manager_api.Dtos.Employee
{
    public class EmployeeTaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public string Status { get; set; } = "";
        public string? ProjectName { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public string? ProofFilePath { get; set; }
        public TaskEvaluationDto? Evaluation { get; set; }
    }
}
