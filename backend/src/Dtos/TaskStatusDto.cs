using task_manager_api.Models;

// ✅ Fix ambiguity between System.Threading.Tasks.TaskStatus and our enum
using TaskStatus = task_manager_api.Models.TaskStatus;

namespace task_manager_api.Dtos
{
    public record TaskStatusDto(TaskStatus Status);
}