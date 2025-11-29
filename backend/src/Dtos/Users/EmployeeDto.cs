namespace task_manager_api.DTOs.Users
{
    public record EmployeeDto(
        Guid Id,
        string Name,
        string Email
    );
}
