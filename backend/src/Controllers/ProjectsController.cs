// backend/src/Controllers/ProjectsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using task_manager_api.Services.Projects;
using task_manager_api.DTOs.Projects; // ← This brings in your real DTOs with Deadline
using System.Security.Claims;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? throw new UnauthorizedAccessException());

        private string CurrentUserRole =>
            User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        private bool IsAdmin => CurrentUserRole == "Admin";
        private bool IsEvaluator => CurrentUserRole == "Evaluator";

        // GET /api/projects
        [HttpGet]
        [Authorize(Roles = "Admin,Evaluator")]
        public async Task<IActionResult> GetAll()
        {
            var projects = IsAdmin
                ? await _projectService.GetAllProjectsAsync()
                : await _projectService.GetProjectsByEvaluatorAsync(CurrentUserId);

            return Ok(projects);
        }

        // GET /api/projects/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null)
                return NotFound("Project not found.");

            if (!IsAdmin &&
                project.EvaluatorId != CurrentUserId &&
                !project.Tasks.Any(t => t.AssignedToId == CurrentUserId))
            {
                return Forbid("Access denied.");
            }

            return Ok(project);
        }

        // POST /api/projects
        [HttpPost]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var project = await _projectService.CreateProjectAsync(
                name: dto.Name,
                description: dto.Description ?? string.Empty,
                evaluatorId: CurrentUserId,
                deadline: dto.Deadline  // ← NOW WORKS! Deadline is in DTO
            );

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }

        // PUT /api/projects/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var project = await _projectService.UpdateProjectAsync(
                id: id,
                name: dto.Name,
                description: dto.Description,
                evaluatorId: CurrentUserId,
                deadline: dto.Deadline  // ← NOW WORKS!
            );

            if (project == null)
                return NotFound("Project not found or access denied.");

            return Ok(project);
        }

        // DELETE /api/projects/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _projectService.DeleteProjectAsync(id, CurrentUserId);
            return success ? NoContent() : NotFound();
        }

        // GET /api/projects/my
        [HttpGet("my")]
        [Authorize(Roles = "Evaluator,Employee")]
        public async Task<IActionResult> GetMyProjects()
        {
            var projects = await _projectService.GetUserProjectsAsync(CurrentUserId);
            return Ok(projects);
        }

        // GET /api/projects/user/{userId} (Admin)
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserProjects(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
                return BadRequest("Invalid user ID");

            var projects = await _projectService.GetProjectsForUserAsync(userGuid);
            var result = projects.Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                Status = p.Status.ToString(),
                p.Deadline
            });

            return Ok(result);
        }

        // GET /api/projects/admin/{projectId}/assignments (Admin)
        [HttpGet("admin/{projectId}/assignments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetProjectAssignments(string projectId)
        {
            if (!Guid.TryParse(projectId, out var projGuid))
                return BadRequest("Invalid project ID");

            var tasks = await _projectService.GetTasksForProjectAsync(projGuid);
            var result = tasks
                .Where(t => t.AssignedTo != null)
                .Select(t => new
                {
                    EmployeeId = t.AssignedTo!.Id,
                    EmployeeName = t.AssignedTo!.Name,
                    EmployeeEmail = t.AssignedTo!.Email,
                    TaskTitle = t.Title,
                    TaskStatus = t.Status.ToString()
                });

            return Ok(result);
        }

        [HttpPost("{id}/assign")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> AssignEmployees(Guid id, [FromBody] AssignEmployeesDto dto)
        {
            var success = await _projectService.AssignEmployeesAsync(id, dto.EmployeeIds, CurrentUserId);
            return success ? Ok() : NotFound();
        }
        // Controllers/ProjectsController.cs
        // In ProjectsController.cs — replace your CompleteProject method with THIS:
[HttpPatch("{id:guid}/complete")]
public async Task<IActionResult> CompleteProject(Guid id)
{
    var evaluatorId = CurrentUserId;

    var success = await _projectService.CompleteProjectAsync(id, evaluatorId);

    if (!success)
        return NotFound(new { message = "Project not found or access denied" });

    return Ok(new { message = "Project marked as completed!", completedAt = DateTime.UtcNow });
}

        [HttpGet("{id}/assignments")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> GetAssignments(Guid id)
        {
            var employees = await _projectService.GetAssignedEmployeesAsync(id);
            return Ok(employees);
        }
    }
    
}