using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;

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

        // POST: api/tasks
        [HttpPost]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
        {
            var evaluator = await _db.Users.FindAsync(dto.CreatedById);
            var employee = await _db.Users.FindAsync(dto.AssignedToId);
            var project = await _db.Projects.FindAsync(dto.ProjectId);

            if (evaluator == null || employee == null || project == null)
                return BadRequest("Invalid references.");
            if (employee.Role != Role.Employee)
                return BadRequest("Assigned user must be an employee.");

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
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] TaskStatusDto dto)
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
