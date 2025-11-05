using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using task_manager_api.Data;
using task_manager_api.Models;
using TaskStatus = task_manager_api.Models.TaskStatus;

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

            var task = await _db.Tasks.Include(t => t.Evaluation).FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null) return NotFound("Task not found.");

            if (task.Evaluation != null)
                return Conflict("Task already has an evaluation. Use PUT to update.");

            var eval = new Evaluation
            {
                TaskId = taskId,
                EvaluatorId = evaluatorId,
                Status = dto.Status,
                Comments = dto.Comments,
                EvaluatedAt = DateTime.UtcNow
            };

            // Apply task status changes depending on evaluation
            ApplyEvaluationToTask(task, eval.Status);

            _db.Evaluations.Add(eval);

            // Add history entry
            _db.TaskHistories.Add(new TaskHistory
            {
                TaskId = taskId,
                Action = $"Evaluation set to {eval.Status}",
                Comments = eval.Comments,
                PerformedById = evaluatorId,
                PerformedAt = DateTime.UtcNow
            });

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
            var evaluatorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if (dto.EvaluatorId != evaluatorId)
                return BadRequest("Can only update evaluation as yourself.");

            var eval = await _db.Evaluations.FirstOrDefaultAsync(e => e.TaskId == taskId);
            if (eval == null) return NotFound("Evaluation not found.");

            eval.Status = dto.Status;
            eval.Comments = dto.Comments;
            eval.EvaluatedAt = DateTime.UtcNow;

            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task != null)
            {
                ApplyEvaluationToTask(task, eval.Status);
            }

            _db.TaskHistories.Add(new TaskHistory
            {
                TaskId = taskId,
                Action = $"Evaluation updated to {eval.Status}",
                Comments = eval.Comments,
                PerformedById = evaluatorId,
                PerformedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            return Ok(eval);
        }

        // DELETE: api/tasks/{taskId}/evaluations
        [HttpDelete]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> Delete(Guid taskId)
        {
            var evaluatorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var eval = await _db.Evaluations.FirstOrDefaultAsync(e => e.TaskId == taskId);
            if (eval == null)
                return NotFound("Evaluation not found.");

            // Optional: only allow the evaluator who created it to delete
            if (eval.EvaluatorId != evaluatorId)
                return Forbid("You can only delete your own evaluations.");

            _db.Evaluations.Remove(eval);

            // Add history log
            _db.TaskHistories.Add(new TaskHistory
            {
                TaskId = taskId,
                Action = "Evaluation deleted",
                Comments = null,
                PerformedById = evaluatorId,
                PerformedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            return NoContent(); // 204 response
        }

        [Authorize(Roles = "Evaluator")]
        [HttpGet("pending-tasks")]
        public async Task<IActionResult> GetPendingTasks()
        {
            var tasks = await _db.Tasks
                .Include(t => t.AssignedTo)
                .Where(t => t.Status == TaskStatus.Submitted) // or whatever you use
                .ToListAsync();

            return Ok(tasks);
        }

        // ✅ Fixed helper: map EvaluationStatus -> TaskStatus correctly
        private void ApplyEvaluationToTask(TaskItem task, EvaluationStatus status)
        {
            switch (status)
            {
                case EvaluationStatus.Approved:
                    task.Status = TaskStatus.Approved; // ✅ matches your enum
                    break;
                case EvaluationStatus.NeedsRevision:
                    task.Status = TaskStatus.NeedsRevision; // ✅ matches your enum
                    break;
                case EvaluationStatus.Rejected:
                    task.Status = TaskStatus.Rejected; // ✅ matches your enum
                    break;
                case EvaluationStatus.Pending:
                default:
                    task.Status = TaskStatus.InProgress; // fallback
                    break;
            }
        }
    }

    public record EvalDto(Guid EvaluatorId, EvaluationStatus Status, string Comments);
}
