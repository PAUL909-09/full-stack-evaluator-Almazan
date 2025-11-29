// backend/src/Controllers/ProjectsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using task_manager_api.Services.Projects;
using task_manager_api.DTOs.Projects;
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

        // Get all projects (admin sees all, evaluator sees only theirs)
        [HttpGet]
        [Authorize(Roles = "Admin,Evaluator")]
        public async Task<IActionResult> GetAll()
        {
            var projects = IsAdmin
                ? await _projectService.GetAllProjectsAsync()
                : await _projectService.GetProjectsByEvaluatorAsync(CurrentUserId);

            return Ok(projects);
        }

        // Get a single project by ID (with access control)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null) return NotFound("Project not found.");

            if (!IsAdmin && project.EvaluatorId != CurrentUserId && !project.Tasks.Any(t => t.AssignedToId == CurrentUserId))
                return Forbid("Access denied.");

            return Ok(project);
        }

        // Create a new project (evaluator only)
        [HttpPost]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var project = await _projectService.CreateProjectAsync(
                name: dto.Name,
                description: dto.Description ?? string.Empty,
                evaluatorId: CurrentUserId,
                deadline: dto.Deadline
            );

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }

        // Update an existing project (evaluator only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var project = await _projectService.UpdateProjectAsync(
                id: id,
                name: dto.Name,
                description: dto.Description,
                evaluatorId: CurrentUserId,
                deadline: dto.Deadline
            );

            if (project == null) return NotFound("Project not found or access denied.");
            return Ok(project);
        }

        // Delete a project (evaluator only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _projectService.DeleteProjectAsync(id, CurrentUserId);
            return success ? NoContent() : NotFound();
        }

        // Get all projects the current user is involved in (evaluator or employee)
        [HttpGet("my")]
        [Authorize(Roles = "Evaluator,Employee")]
        public async Task<IActionResult> GetMyProjects()
        {
            var projects = await _projectService.GetUserProjectsAsync(CurrentUserId);
            return Ok(projects);
        }

        // Admin: Get all projects assigned to a specific user
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

        // Admin: Get task assignments in a project (who is doing what)
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

        // Assign employees to a project (evaluator or admin)
        [HttpPost("{id}/assign")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> AssignEmployees(Guid id, [FromBody] AssignEmployeesDto dto)
        {
            var success = await _projectService.AssignEmployeesAsync(id, dto.EmployeeIds, CurrentUserId);
            return success ? Ok() : NotFound();
        }

        // Mark a project as completed (evaluator only)
        [HttpPatch("{id:guid}/complete")]
        public async Task<IActionResult> CompleteProject(Guid id)
        {
            var success = await _projectService.CompleteProjectAsync(id, CurrentUserId);

            if (!success)
                return NotFound(new { message = "Project not found or access denied" });

            return Ok(new { message = "Project marked as completed!", completedAt = DateTime.UtcNow });
        }

        // Get all employees assigned to a project
        [HttpGet("{id}/assignments")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> GetAssignments(Guid id)
        {
            var employees = await _projectService.GetAssignedEmployeesAsync(id);
            return Ok(employees);
        }
    }
}