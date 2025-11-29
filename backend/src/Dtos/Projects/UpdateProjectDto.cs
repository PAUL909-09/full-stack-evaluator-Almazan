// backend/src/DTOs/Projects/UpdateProjectDto.cs
namespace task_manager_api.DTOs.Projects
{
    public class UpdateProjectDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime? Deadline { get; set; }  // ← THIS WAS MISSING
    }
}