using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using System.Security.Claims; 
using task_manager_api.Dtos;

// ✅ Fix ambiguity between System.Threading.Tasks.TaskStatus and our enum
using TaskStatus = task_manager_api.Models.TaskStatus;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public TasksController(ApplicationDbContext db) => _db = db;

        // GET: api/tasks
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _db.Tasks
                .Include(t => t.Project)
                .Include(t => t.AssignedTo)
                .Include(t => t.Comments)
                .Include(t => t.Evaluation)
                .ToListAsync();

            return Ok(tasks);
        }

        // GET: api/tasks/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _db.Tasks
                .Include(t => t.Project)
                .Include(t => t.AssignedTo)
                .Include(t => t.Comments)
                .Include(t => t.Evaluation)
                .FirstOrDefaultAsync(t => t.Id == id);

            return task == null ? NotFound("Task not found.") : Ok(task);
        }

        // ✅ NEW: GET: api/tasks/project/{projectId} - Fetch tasks for a specific project
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProject(Guid projectId)
        {
            var tasks = await _db.Tasks
                .Where(t => t.ProjectId == projectId)
                .Include(t => t.AssignedTo)  // Include assigned employee details
                .Include(t => t.Project)     // Include project details
                .ToListAsync();

            return Ok(tasks);
        }

        // ✅ NEW: GET: api/tasks/project/{projectId}/employees - Fetch unique employees assigned to tasks in a project
        [HttpGet("project/{projectId}/employees")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> GetEmployeesByProject(Guid projectId)
        {
            // Check if the evaluator owns the project (for security)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
                return Unauthorized("Invalid user token.");

            var project = await _db.Projects.FindAsync(projectId);
            if (project == null) return NotFound("Project not found.");
            if (project.EvaluatorId != currentUserId) return Forbid("You can only access employees for your own projects.");

            var employees = await _db.Tasks
                .Where(t => t.ProjectId == projectId && t.AssignedTo != null)
                .Select(t => t.AssignedTo)
                .Distinct()
                .ToListAsync();

            return Ok(employees);
        }

        // POST: api/tasks (Updated with ownership check)
        [HttpPost]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
        {
            // Extract current user ID from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
                return Unauthorized("Invalid user token.");

            var evaluator = await _db.Users.FindAsync(dto.CreatedById);
            var employee = await _db.Users.FindAsync(dto.AssignedToId);
            var project = await _db.Projects.FindAsync(dto.ProjectId);

            if (evaluator == null || employee == null || project == null)
                return BadRequest("Invalid references.");
            if (employee.Role != Role.Employee)
                return BadRequest("Assigned user must be an employee.");
            // ✅ NEW: Ensure evaluator owns the project
            if (project.EvaluatorId != currentUserId)
                return Forbid("You can only create tasks for your own projects.");

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                CreatedById = evaluator.Id,
                AssignedToId = employee.Id,
                ProjectId = project.Id,
                Status = TaskStatus.Todo
            };

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
        }

        // PUT: api/tasks/{id}/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Employee,Evaluator")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] TaskStatusDto dto)  // ✅ Now uses shared DTO
        {
            var task = await _db.Tasks.FindAsync(id);
            if (task == null) return NotFound("Task not found.");
            task.Status = dto.Status;
            await _db.SaveChangesAsync();
            return Ok(task);
        }


        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var task = await _db.Tasks.FindAsync(id);
            if (task == null) return NotFound("Task not found.");
            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        public record CreateTaskDto(string Title, string Description, Guid ProjectId, Guid CreatedById, Guid AssignedToId);
        public record TaskStatusDto(TaskStatus Status);
    }
}