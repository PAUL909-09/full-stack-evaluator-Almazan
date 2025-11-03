using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using task_manager_api.Data;
using task_manager_api.Models;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/tasks/{taskId}/evaluations")]
    [Authorize]
    public class EvaluationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public EvaluationsController(ApplicationDbContext db) => _db = db;

        // POST: api/tasks/{taskId}/evaluations
        [HttpPost]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Evaluate(Guid taskId, [FromBody] EvalDto dto)
        {
            var evaluatorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if (dto.EvaluatorId != evaluatorId)
                return BadRequest("Can only evaluate as yourself.");

            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null) return NotFound("Task not found.");

            if (await _db.Evaluations.AnyAsync(e => e.TaskId == taskId))
                return Conflict("Task already evaluated.");

            var eval = new Evaluation
            {
                TaskId = taskId,
                EvaluatorId = evaluatorId,
                Score = dto.Score,
                Comments = dto.Comments
            };

            _db.Evaluations.Add(eval);
            await _db.SaveChangesAsync();
            return Ok(eval);
        }

        // GET: api/tasks/{taskId}/evaluations
        [HttpGet]
        public async Task<IActionResult> Get(Guid taskId)
        {
            var eval = await _db.Evaluations
                .Include(e => e.Evaluator)
                .FirstOrDefaultAsync(e => e.TaskId == taskId);

            return eval == null ? NotFound() : Ok(eval);
        }

        // PUT: api/tasks/{taskId}/evaluations
        [HttpPut]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Update(Guid taskId, [FromBody] EvalDto dto)
        {
            var eval = await _db.Evaluations.FirstOrDefaultAsync(e => e.TaskId == taskId);
            if (eval == null) return NotFound("Evaluation not found.");
            eval.Score = dto.Score;
            eval.Comments = dto.Comments;
            eval.EvaluatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(eval);
        }
    }

    public record EvalDto(Guid EvaluatorId, decimal Score, string Comments);
}
