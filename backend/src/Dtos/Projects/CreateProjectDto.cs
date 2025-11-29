// backend/src/DTOs/Projects/CreateProjectDto.cs
namespace task_manager_api.DTOs.Projects
{
    public class CreateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? Deadline { get; set; }  // ← THIS WAS MISSING
    }
}