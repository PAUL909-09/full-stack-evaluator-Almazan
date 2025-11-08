using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using task_manager_api.Dtos;
using task_manager_api.Models;

namespace task_manager_api.Services.Tasks
{
    // Resolve ambiguity once at the top of the file
    using TaskStatus = Models.TaskStatus;

    public interface ITaskService
    {
        Task<IEnumerable<TaskItem>> GetAllAsync();
        Task<TaskItem?> GetByIdAsync(Guid id);
        Task<IEnumerable<TaskItem>> GetByProjectAsync(Guid projectId);
        Task<IEnumerable<User>> GetEmployeesByProjectAsync(Guid projectId, Guid evaluatorId);
        Task<TaskItem> CreateAsync(CreateTaskDto dto, Guid evaluatorId);
        Task<TaskItem?> UpdateStatusAsync(Guid id, TaskStatus newStatus, Guid userId, string role);

        // <-- NEW: update task fields (title/description/assignedTo)
        Task<TaskItem?> UpdateAsync(Guid id, UpdateTaskDto dto, Guid evaluatorId);

        Task<bool> DeleteAsync(Guid id, Guid evaluatorId);
    }
}
