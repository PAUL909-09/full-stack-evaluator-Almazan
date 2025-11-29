using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using System.Security.Claims;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/projectassignments")]
    [Authorize] // All endpoints require authentication
    public class ProjectAssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ProjectAssignmentsController(ApplicationDbContext db)
        {
            _db = db;
        }

        private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        private string CurrentUserRole => User.FindFirst(ClaimTypes.Role)!.Value;
        private bool IsAdmin => CurrentUserRole == "Admin";
        private bool IsEvaluator => CurrentUserRole == "Evaluator";

        // Get all employees assigned to a specific project
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProject(Guid projectId)
        {
            var project = await _db.Projects
                .Include(p => p.AssignedEmployees)
                .ThenInclude(pa => pa.User)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null)
                return NotFound("Project not found.");

            var employees = project.AssignedEmployees
                .Select(pa => new
                {
                    pa.Id,
                    pa.UserId,
                    pa.User.Name,
                    pa.User.Email
                });

            return Ok(employees);
        }

        // Assign one or more employees to a project (idempotent - skips duplicates)
        [HttpPost]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> Assign([FromBody] AssignRequest request)
        {
            var project = await _db.Projects
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId);

            if (project == null)
                return NotFound("Project not found.");

            if (!IsAdmin && project.EvaluatorId != CurrentUserId)
                return Forbid("You are not allowed to modify this project.");

            var alreadyAssigned = await _db.ProjectAssignments
                .Where(pa => pa.ProjectId == request.ProjectId)
                .Select(pa => pa.UserId)
                .ToListAsync();

            var newAssignments = request.UserIds
                .Where(uid => !alreadyAssigned.Contains(uid))
                .Select(uid => new ProjectAssignment
                {
                    ProjectId = request.ProjectId,
                    UserId = uid
                })
                .ToList();

            _db.ProjectAssignments.AddRange(newAssignments);
            await _db.SaveChangesAsync();

            return Ok("Employees assigned successfully.");
        }

        // Remove an employee from a project (by assignment ID)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> Remove(Guid id)
        {
            var assignment = await _db.ProjectAssignments
                .Include(a => a.Project)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
                return NotFound();

            if (!IsAdmin && assignment.Project.EvaluatorId != CurrentUserId)
                return Forbid();

            _db.ProjectAssignments.Remove(assignment);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // Request DTO for assigning employees to a project
        public class AssignRequest
        {
            public Guid ProjectId { get; set; }
            public List<Guid> UserIds { get; set; } = new();
        }
    }
}