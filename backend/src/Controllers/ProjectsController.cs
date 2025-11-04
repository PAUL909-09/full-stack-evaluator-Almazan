using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using System.Security.Claims; // Added: For extracting user ID from claims

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public ProjectsController(ApplicationDbContext db) => _db = db;

        // GET: api/projects
        [HttpGet]
        [Authorize(Roles = "Admin,Evaluator")]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _db.Projects
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
                .ToListAsync();

            return Ok(projects);
        }

        // GET: api/projects/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Evaluator")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var project = await _db.Projects
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return NotFound("Project not found.");
            return Ok(project);
        }

        // POST: api/projects
        [HttpPost]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            var evaluator = await _db.Users.FindAsync(dto.EvaluatorId);
            if (evaluator == null || evaluator.Role != Role.Evaluator)
                return BadRequest("Invalid evaluator.");

            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                EvaluatorId = dto.EvaluatorId
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }

        // PUT: api/projects/{id}  // Added: Update endpoint
        [HttpPut("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto dto)
        {
            try
            {
                // Extract current user ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
                    return Unauthorized("Invalid user token.");

                // Find the project
                var project = await _db.Projects.FindAsync(id);
                if (project == null) return NotFound("Project not found.");

                // Check if the current user is the project's evaluator
                if (project.EvaluatorId != currentUserId)
                    return Forbid("You can only update projects you created.");

                // Update fields
                project.Name = dto.Name ?? project.Name;
                project.Description = dto.Description ?? project.Description;

                await _db.SaveChangesAsync();

                return Ok(project); // Return updated project
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error updating project {id}: {ex.Message}");
                return StatusCode(500, "An error occurred while updating the project.");
            }
        }

        // DELETE: api/projects/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                // Extract current user ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
                    return Unauthorized("Invalid user token.");

                // Find the project
                var project = await _db.Projects.FindAsync(id);
                if (project == null) return NotFound("Project not found.");

                // Check if the current user is the project's evaluator
                if (project.EvaluatorId != currentUserId)
                    return Forbid("You can only delete projects you created.");

                // Delete the project
                _db.Projects.Remove(project);
                await _db.SaveChangesAsync();

                return NoContent(); // Success
            }
            catch (Exception ex)
            {
                // Log the error (use your logging framework, e.g., Serilog)
                Console.WriteLine($"Error deleting project {id}: {ex.Message}");
                return StatusCode(500, "An error occurred while deleting the project.");
            }
        }

        // ✅ Moved this endpoint inside the controller class
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin,Evaluator,Employee")]
        public async Task<IActionResult> GetUserProjects(Guid userId)
        {
            var projects = await _db.Projects
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
                .Where(p => p.EvaluatorId == userId || p.Tasks.Any(t => t.AssignedToId == userId))
                .ToListAsync();

            return Ok(projects);
        }

        // Added: Record for update DTO
        public record UpdateProjectDto(string? Name, string? Description);

        // record should remain last
        public record CreateProjectDto(string Name, string Description, Guid EvaluatorId);
    }
}