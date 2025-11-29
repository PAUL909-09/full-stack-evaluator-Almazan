namespace task_manager_api.Dtos
{
    public record CreateTaskDto(
        string Title,
        string? Description,
        Guid ProjectId,
        Guid CreatedById,
        Guid AssignedToId,
        DateTime? Deadline);
}