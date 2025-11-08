namespace task_manager_api.Dtos
{
    public record UpdateTaskDto(
        string? Title = null,
        string? Description = null,
        Guid? AssignedToId = null
    );
}
