using System.Security.Claims;
using task_manager_api.Dtos.Employee;

namespace task_manager_api.Services.Employees
{
    public interface IEmployeeTaskService
    {
        Task<IEnumerable<EmployeeTaskDto>> GetMyTasksAsync(ClaimsPrincipal user);
    }
}
