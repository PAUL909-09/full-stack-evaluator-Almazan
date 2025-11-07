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
    [Route("api/employees")]
    [Authorize(Roles = "Employee")]  // Only employees can access
    public class EmployeesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public EmployeesController(ApplicationDbContext db) => _db = db;

        // GET: api/employees/tasks - Fetch tasks assigned to the current employee
        [HttpGet("tasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            // Extract current user ID from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
                return Unauthorized("Invalid user token.");

            var tasks = await _db.Tasks
                .Where(t => t.AssignedToId == currentUserId)
                .Include(t => t.Project)      // Include project details
                .Include(t => t.CreatedBy)    // Include evaluator who created the task
                .Include(t => t.Comments)
                .Include(t => t.Evaluation)
                .ToListAsync();

            return Ok(tasks);
        }

        // ✅ NEW: GET: api/employees - Fetch all employees (for evaluators to assign)
        [HttpGet]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> GetAllEmployees()
        {
            var employees = await _db.Users
                .Where(u => u.Role == Role.Employee)
                .ToListAsync();
            return Ok(employees);
        }

        // PUT: api/employees/tasks/{id}/status - Update status of a task assigned to the current employee
        [HttpPut("tasks/{id}/status")]
        public async Task<IActionResult> UpdateMyTaskStatus(Guid id, [FromBody] TaskStatusDto dto)
        {
            // Extract current user ID from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
                return Unauthorized("Invalid user token.");

            // Find the task
            var task = await _db.Tasks.FindAsync(id);
            if (task == null) return NotFound("Task not found.");

            // Ensure the task is assigned to the current employee
            if (task.AssignedToId != currentUserId)
                return Forbid("You can only update tasks assigned to you.");

            // Update status
            task.Status = dto.Status;
            await _db.SaveChangesAsync();

            return Ok(task);
        }

        // DTO for status updates
        public record TaskStatusDto(TaskStatus Status);
    }
}