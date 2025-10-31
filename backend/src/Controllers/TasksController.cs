using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using task_manager_api.Data;
using task_manager_api.Models;

// Avoid TaskStatus conflict
using ModelTaskStatus = task_manager_api.Models.TaskStatus;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TasksController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTask([FromBody] TaskItem t)
    {
        await _db.Tasks.AddAsync(t);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTask), new { id = t.Id }, t);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(Guid id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpPost("{id}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignTask(Guid id, [FromBody] AssignDto dto)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        task.AssignedTo = dto.AssignedTo;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] Guid? assignedTo, [FromQuery] ModelTaskStatus? status)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        if (userRole != "Admin" && assignedTo != userId)
            return Forbid();

        var query = _db.Tasks.AsQueryable();
        if (assignedTo.HasValue) query = query.Where(t => t.AssignedTo == assignedTo);
        if (status.HasValue) query = query.Where(t => t.Status == status.Value);

        return Ok(await query.ToListAsync());
    }
}

public record AssignDto(Guid AssignedTo);
