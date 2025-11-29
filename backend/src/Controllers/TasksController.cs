using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Dtos;
using task_manager_api.Models;
using task_manager_api.Services.Tasks;
using System.Security.Claims;

namespace task_manager_api.Controllers
{
    using TaskStatus = Models.TaskStatus;

    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ITaskService _taskService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TasksController(
            ApplicationDbContext db,
            ITaskService taskService,
            IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _taskService = taskService;
            _httpContextAccessor = httpContextAccessor;
        }

        private (Guid userId, string role) GetCurrentUser()
        {
            var user = _httpContextAccessor.HttpContext!.User;

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("User ID claim is missing.");

            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ?? "";

            if (!Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Invalid user ID in token.");

            return (userId, roleClaim);
        }

        // Get all tasks (admin/evaluator view)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _taskService.GetAllAsync();
            return Ok(tasks);
        }

        // Get a single task by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _taskService.GetByIdAsync(id);
            return task == null ? NotFound("Task not found.") : Ok(task);
        }

        // Get all tasks belonging to a specific project
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProject(Guid projectId)
        {
            var tasks = await _taskService.GetByProjectAsync(projectId);
            return Ok(tasks);
        }

        // Get all employees assigned to tasks in a project (evaluator only)
        [HttpGet("project/{projectId}/employees")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> GetEmployeesByProject(Guid projectId)
        {
            var (userId, _) = GetCurrentUser();
            var employees = await _taskService.GetEmployeesByProjectAsync(projectId, userId);
            return Ok(employees);
        }

        // Create a new task (evaluator only)
        [HttpPost]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (userId, _) = GetCurrentUser();

            try
            {
                var task = await _taskService.CreateAsync(dto, userId);
                return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (UnauthorizedAccessException) { return Forbid("You can only create tasks for projects you own."); }
            catch { return StatusCode(500, "An error occurred while creating the task."); }
        }

        // Update an existing task (evaluator only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (userId, _) = GetCurrentUser();

            try
            {
                var updated = await _taskService.UpdateAsync(id, dto, userId);
                return updated == null ? NotFound("Task not found.") : Ok(updated);
            }
            catch (UnauthorizedAccessException) { return Forbid("You can only update tasks for projects you own."); }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch { return StatusCode(500, "Failed to update task."); }
        }

        // Update task status (employee: submit, evaluator: approve/reject)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Employee,Evaluator")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] TaskStatusDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (userId, role) = GetCurrentUser();

            try
            {
                var task = await _taskService.UpdateStatusAsync(id, dto.Status, userId, role);
                return task == null ? NotFound("Task not found.") : Ok(task);
            }
            catch (UnauthorizedAccessException) { return Forbid("You are not authorized to update this task's status."); }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
            catch { return StatusCode(500, "Failed to update task status."); }
        }

        // Delete a task (evaluator or admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var (userId, _) = GetCurrentUser();
                var success = await _taskService.DeleteAsync(id, userId);
                return success ? NoContent() : NotFound("Task not found or you don't have permission.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Get full history of actions performed on a task (audit trail)
        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetHistory(Guid id)
        {
            var taskExists = await _db.Tasks.AnyAsync(t => t.Id == id);
            if (!taskExists) return NotFound("Task not found.");

            var history = await _db.TaskHistories
                .Where(h => h.TaskId == id)
                .Include(h => h.PerformedBy)
                .OrderBy(h => h.PerformedAt)
                .Select(h => new
                {
                    h.Id,
                    h.Action,
                    h.Comments,
                    PerformedBy = h.PerformedBy != null
                        ? new { h.PerformedBy.Id, h.PerformedBy.Name, h.PerformedBy.Email }
                        : null,
                    h.PerformedAt
                })
                .ToListAsync();

            return Ok(history);
        }
    }
}