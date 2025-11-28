using task_manager_api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using task_manager_api.DTOs.Users;

namespace task_manager_api.Services.Projects
{
    public interface IProjectService
    {
        Task<IEnumerable<Project>> GetAllProjectsAsync();
        Task<Project?> GetProjectByIdAsync(Guid id);
        // IProjectService.cs
        Task<Project> CreateProjectAsync(string name, string? description, Guid evaluatorId, DateTime? deadline = null);
        Task<Project?> UpdateProjectAsync(Guid id, string? name, string? description, Guid evaluatorId, DateTime? deadline = null);
        Task<bool> DeleteProjectAsync(Guid id, Guid evaluatorId);
        Task<IEnumerable<Project>> GetUserProjectsAsync(Guid userId);
        Task<IEnumerable<Project>> GetProjectsByEvaluatorAsync(Guid evaluatorId);

        Task<bool> AssignEmployeesAsync(Guid projectId, List<Guid> employeeIds, Guid currentUserId);
        Task<IEnumerable<EmployeeDto>> GetAssignedEmployeesAsync(Guid projectId);

        Task<List<Project>> GetProjectsForUserAsync(Guid userId);
        Task<List<TaskItem>> GetTasksForProjectAsync(Guid projectId);


    }
}