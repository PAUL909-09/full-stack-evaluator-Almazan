using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using task_manager_api.Services.Projects;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations; 
using task_manager_api.DTOs.Projects;


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

        // -----------------------------------------------------------------
        // Helper properties – safe because [Authorize] guarantees a token
        // -----------------------------------------------------------------
        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        private string CurrentUserRole =>
            User.FindFirst(ClaimTypes.Role)!.Value;

        private bool IsAdmin => CurrentUserRole == "Admin";
        private bool IsEvaluator => CurrentUserRole == "Evaluator";

        // -----------------------------------------------------------------
        // GET /api/projects   (Admin → all, Evaluator → own)
        // -----------------------------------------------------------------
        [HttpGet]
        [Authorize(Roles = "Admin,Evaluator")]
        public async Task<IActionResult> GetAll()
        {
            var projects = IsAdmin
                ? await _projectService.GetAllProjectsAsync()
                : await _projectService.GetProjectsByEvaluatorAsync(CurrentUserId);

            return Ok(projects);
        }

        // -----------------------------------------------------------------
        // GET /api/projects/{id}
        // -----------------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null)
                return NotFound("Project not found.");

            // ---- access control ------------------------------------------------
            if (!IsAdmin &&
                project.EvaluatorId != CurrentUserId &&
                !project.Tasks.Any(t => t.AssignedToId == CurrentUserId))
            {
                return Forbid("You do not have access to this project.");
            }

            return Ok(project);
        }

        // -----------------------------------------------------------------
        // POST /api/projects
        // -----------------------------------------------------------------
        [HttpPost]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Service expects a non-null description → provide empty string if missing
            var description = dto.Description ?? string.Empty;

            var project = await _projectService.CreateProjectAsync(dto.Name, description, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }

        // -----------------------------------------------------------------
        // PUT /api/projects/{id}
        // -----------------------------------------------------------------
        [HttpPut("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var project = await _projectService.UpdateProjectAsync(
                id,
                dto.Name,
                dto.Description,   // can be null → service already handles ?? fallback
                CurrentUserId);

            if (project == null)
                return NotFound("Project not found or you are not the owner.");

            return Ok(project);
        }

        // -----------------------------------------------------------------
        // DELETE /api/projects/{id}
        // -----------------------------------------------------------------
        [HttpDelete("{id}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _projectService.DeleteProjectAsync(id, CurrentUserId);
            return success ? NoContent() : NotFound("Project not found or you are not the owner.");
        }

        // -----------------------------------------------------------------
        // GET /api/projects/my   (any logged-in user)
        // -----------------------------------------------------------------
        [HttpGet("my")]
        [Authorize(Roles = "Evaluator,Employee")]
        public async Task<IActionResult> GetMyProjects()
        {
            var projects = await _projectService.GetUserProjectsAsync(CurrentUserId);
            return Ok(projects);
        }

        // -----------------------------------------------------------------
        // GET /api/projects/user/{userId}   (Admin only)
        // -----------------------------------------------------------------
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserProjects(Guid userId)
        {
            var projects = await _projectService.GetUserProjectsAsync(userId);
            return Ok(projects);
        }

        [HttpPost("{id}/assign")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> AssignEmployees(Guid id, [FromBody] AssignEmployeesDto dto)
        {
            var success = await _projectService.AssignEmployeesAsync(id, dto.EmployeeIds, CurrentUserId);
            return success ? Ok() : NotFound("Project not found or permission denied.");
        }

        [HttpGet("{id}/assignments")]
        [Authorize(Roles = "Evaluator,Admin")]
        public async Task<IActionResult> GetAssignments(Guid id)
        {
            var employees = await _projectService.GetAssignedEmployeesAsync(id);
            return Ok(employees);
        }


        // -----------------------------------------------------------------
        // DTOs – validation attributes
        // -----------------------------------------------------------------
        public record CreateProjectDto(
            [Required] string Name,
            string? Description = null);

        public record UpdateProjectDto(
            string? Name = null,
            string? Description = null);
    }
}