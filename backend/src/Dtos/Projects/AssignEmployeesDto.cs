using System.ComponentModel.DataAnnotations;

namespace task_manager_api.DTOs.Projects
{
    public record AssignEmployeesDto([Required] List<Guid> EmployeeIds);
}
