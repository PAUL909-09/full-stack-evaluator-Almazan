using task_manager_api.Models;

using TaskStatus = task_manager_api.Models.TaskStatus;

namespace task_manager_api.Dtos
{
    public record TaskStatusDto(TaskStatus Status);
}