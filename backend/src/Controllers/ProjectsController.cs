using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;

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
        [Authorize(Roles = "Admin")]
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

        // DELETE: api/projects/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var project = await _db.Projects.FindAsync(id);
            if (project == null) return NotFound("Project not found.");
            _db.Projects.Remove(project);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        public record CreateProjectDto(string Name, string Description, Guid EvaluatorId);
    }
}
