using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using task_manager_api.DTOs.Evaluation;
using task_manager_api.Models;
using task_manager_api.Services;

namespace task_manager_api.Controllers
{
    [Route("api/evaluations")]
    [ApiController]
    public class EvaluationsController : BaseApiController
    {
        private readonly IEvaluationService _service;

        public EvaluationsController(IEvaluationService service, IHttpContextAccessor accessor)
            : base(accessor)
        {
            _service = service;
        }

        // GET: api/evaluations/{taskId}
        [HttpGet("{taskId:guid}")]
        [Authorize]
        public async Task<IActionResult> GetEvaluation(Guid taskId)
        {
            var evaluation = await _service.GetEvaluationByTaskId(taskId);
            if (evaluation == null) return NotFound();
            return Ok(evaluation);
        }

        // POST  api/evaluations          → first evaluation
        // PUT   api/evaluations/{taskId} → re-evaluation (e.g. after revision)
        [HttpPost]
        [HttpPut("{taskId:guid?}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> SaveEvaluation(Guid? taskId, [FromBody] EvaluationCreateDto dto)
        {
            // Check model state for validation errors (e.g., missing TaskId in POST)
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);  // Returns detailed validation errors
            }

            Guid actualTaskId;
            if (taskId.HasValue)
            {
                // PUT case: Use route parameter (guaranteed non-null)
                actualTaskId = taskId.Value;
            }
            else
            {
                // POST case: Use DTO (now guaranteed non-null due to [Required])
                actualTaskId = dto.TaskId;
            }

            var (userId, _) = GetCurrentUser();

            var evaluation = new Evaluation
            {
                TaskId = actualTaskId,  // Now always non-null
                EvaluatorId = userId,
                Status = dto.Status,
                Comments = dto.Comments ?? string.Empty
            };

            await _service.UpsertEvaluation(evaluation);

            return Ok(new { message = "Evaluation saved successfully." });
        }

        // DELETE: api/evaluations/{taskId}
        [HttpDelete("{taskId:guid}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> DeleteEvaluation(Guid taskId)
        {
            await _service.DeleteEvaluation(taskId);
            return Ok(new { message = "Evaluation deleted." });
        }

        // GET: api/evaluations/pending → tasks waiting for evaluation
        [HttpGet("pending")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> GetPendingTasks()
        {
            var tasks = await _service.GetPendingTasks();
            return Ok(tasks);
        }

        // GET: api/evaluations/my-history → evaluator sees all their past evaluations
        [HttpGet("my-history")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> GetMyHistory()
        {
            var (userId, _) = GetCurrentUser();
            var history = await _service.GetEvaluationHistoryByEvaluator(userId);
            return Ok(history);
        }
    }
}