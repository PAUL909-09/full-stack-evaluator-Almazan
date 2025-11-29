using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Dtos;
using task_manager_api.Models;
using task_manager_api.Services.Tasks;               // <-- NEW
using System.Security.Claims;

namespace task_manager_api.Controllers
{
    // Resolve TaskStatus ambiguity once for the whole file
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

        // --------------------------------------------------------------------
        // Helper – extract current user id + role from JWT
        // --------------------------------------------------------------------
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

        // GET: api/tasks
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _taskService.GetAllAsync();
            return Ok(tasks);
        }

        // GET: api/tasks/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _taskService.GetByIdAsync(id);
            return task == null
                ? NotFound("Task not found.")
                : Ok(task);
        }

        // GET: api/tasks/project/{projectId}
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProject(Guid projectId)
        {
            var tasks = await _taskService.GetByProjectAsync(projectId);
            return Ok(tasks);
        }

        // GET: api/tasks/project/{projectId}/employees
        [HttpGet("project/{projectId}/employees")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> GetEmployeesByProject(Guid projectId)
        {
            var (userId, _) = GetCurrentUser();

            var employees = await _taskService.GetEmployeesByProjectAsync(projectId, userId);
            return Ok(employees);
        }

        // POST: api/tasks
        [HttpPost]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (userId, _) = GetCurrentUser();

            try
            {
                var task = await _taskService.CreateAsync(dto, userId);
                return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("You can only create tasks for projects you own.");
            }
            catch (Exception)                     // <-- removed unused 'ex'
            {
                return StatusCode(500, "An error occurred while creating the task.");
            }
        }
        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (userId, _) = GetCurrentUser();

            try
            {
                var updated = await _taskService.UpdateAsync(id, dto, userId);
                if (updated == null)
                    return NotFound("Task not found.");

                return Ok(updated);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("You can only update tasks for projects you own.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "Failed to update task.");
            }
        }

        // PUT: api/tasks/{id}/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Employee,Evaluator")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] TaskStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (userId, role) = GetCurrentUser();

            try
            {
                var task = await _taskService.UpdateStatusAsync(id, dto.Status, userId, role);
                return task == null
                    ? NotFound("Task not found.")
                    : Ok(task);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("You are not authorized to update this task's status.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)                     // <-- removed unused 'ex'
            {
                return StatusCode(500, "Failed to update task status.");
            }
        }

        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var (userId, _) = GetCurrentUser();
                var success = await _taskService.DeleteAsync(id, userId);
                return success
                    ? NoContent()
                    : NotFound("Task not found or you don't have permission to delete it.");
            }
            catch (Exception ex)
            {
                // Log the exception (e.g., via ILogger)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // ---------------------------------------------------------------
        // OPTIONAL: Get task history (nice for Swagger demo)
        // ---------------------------------------------------------------
        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetHistory(Guid id)
        {
            var taskExists = await _db.Tasks.AnyAsync(t => t.Id == id);
            if (!taskExists)
                return NotFound("Task not found.");

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