using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using System.Security.Claims;
using task_manager_api.Dtos;
using System.IO;  // For file handling
using Microsoft.AspNetCore.Http;  // For IFormFile

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
        private readonly IWebHostEnvironment _env;  // For file paths

        public EmployeesController(ApplicationDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

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
        // ✅ UPDATED: Now accepts file upload for submission proof
        [HttpPut("tasks/{id}/status")]
        public async Task<IActionResult> UpdateMyTaskStatus(Guid id, [FromForm] TaskStatusUpdateDto dto)
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

            // Validate file if status is "Submitted"
            if (dto.Status == TaskStatus.Submitted)
            {
                if (dto.ProofFile == null || dto.ProofFile.Length == 0)
                    return BadRequest("Proof file is required when submitting a task.");

                // Validate file type and size
                var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
                var fileExtension = Path.GetExtension(dto.ProofFile.FileName).ToLower();
                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Only PDF and image files (JPG, PNG) are allowed.");

                if (dto.ProofFile.Length > 5 * 1024 * 1024)  // 5MB limit
                    return BadRequest("File size must be less than 5MB.");

                // Save the file
                var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "tasks");
                Directory.CreateDirectory(uploadsDir);  // Ensure directory exists
                var fileName = $"{id}_{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ProofFile.CopyToAsync(stream);
                }

                // Update task with proof and timestamp
                task.ProofFilePath = $"/uploads/tasks/{fileName}";  // Relative path for serving
                task.SubmittedAt = DateTime.UtcNow;
            }

            // Update status
            task.Status = dto.Status;
            await _db.SaveChangesAsync();

            return Ok(task);
        }

        // ✅ UPDATED DTO: Now includes file upload
        public record TaskStatusUpdateDto(TaskStatus Status, IFormFile? ProofFile);
    }
}
