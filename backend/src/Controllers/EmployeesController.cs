using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using System.Security.Claims;
using task_manager_api.Dtos;
using System.IO;
using Microsoft.AspNetCore.Http;
using task_manager_api.Services.Employees;

using TaskStatus = task_manager_api.Models.TaskStatus;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/employees")]
    [Authorize(Roles = "Employee")]  // Default: only employees can access
    public class EmployeesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IWebHostEnvironment _env;

        public EmployeesController(ApplicationDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // Get all tasks assigned to the current logged-in employee
        [HttpGet("tasks")]
        public async Task<IActionResult> GetMyTasks([FromServices] IEmployeeTaskService taskService)
        {
            try
            {
                var tasks = await taskService.GetMyTasksAsync(User);
                return Ok(tasks);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("Invalid user token.");
            }
        }

        // Get list of all employees (used by evaluators to assign tasks)
        [HttpGet]
        [Authorize(Roles = "Evaluator")]  // Only evaluators can list employees
        public async Task<IActionResult> GetAllEmployees()
        {
            var employees = await _db.Users
                .Where(u => u.Role == Role.Employee)
                .ToListAsync();
            return Ok(employees);
        }

        // Update task status (e.g., InProgress → Submitted) and upload proof file if submitting
        [HttpPut("tasks/{id}/status")]
        public async Task<IActionResult> UpdateMyTaskStatus(Guid id, [FromForm] TaskStatusUpdateDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
                return Unauthorized("Invalid user token.");

            var task = await _db.Tasks
                .Include(t => t.Evaluation)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound("Task not found.");
            if (task.AssignedToId != currentUserId)
                return Forbid("You can only update tasks assigned to you.");

            var isSubmission = dto.Status == TaskStatus.Submitted;

            if (isSubmission)
            {
                if (dto.ProofFile == null || dto.ProofFile.Length == 0)
                    return BadRequest("Proof file is required when submitting a task.");

                var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
                var fileExtension = Path.GetExtension(dto.ProofFile.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Only PDF, JPG, JPEG, and PNG files are allowed.");

                if (dto.ProofFile.Length > 5 * 1024 * 1024)
                    return BadRequest("File size must be less than 5MB.");

                var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "tasks");
                Directory.CreateDirectory(uploadsDir);
                var safeFileName = $"{id}_{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsDir, safeFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ProofFile.CopyToAsync(stream);
                }

                task.ProofFilePath = $"/uploads/tasks/{safeFileName}";
                task.SubmittedAt = DateTime.UtcNow;
            }

            task.Status = dto.Status;
            await _db.SaveChangesAsync();

            return Ok(task);
        }

        // DTO for updating task status (with optional file upload when submitting)
        public record TaskStatusUpdateDto(TaskStatus Status, IFormFile? ProofFile);
    }
}