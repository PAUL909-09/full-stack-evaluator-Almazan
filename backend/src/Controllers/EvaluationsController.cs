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

        // Get evaluation for a specific task (by task ID)
        [HttpGet("{taskId:guid}")]
        [Authorize]
        public async Task<IActionResult> GetEvaluation(Guid taskId)
        {
            var evaluation = await _service.GetEvaluationByTaskId(taskId);
            if (evaluation == null) return NotFound();
            return Ok(evaluation);
        }

        // Create first evaluation (POST) or update existing one (PUT) after revision
        [HttpPost]
        [HttpPut("{taskId:guid?}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> SaveEvaluation(Guid? taskId, [FromBody] EvaluationCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Guid actualTaskId = taskId ?? dto.TaskId;
            var (userId, _) = GetCurrentUser();

            var evaluation = new Evaluation
            {
                TaskId = actualTaskId,
                EvaluatorId = userId,
                Status = dto.Status,
                Comments = dto.Comments ?? string.Empty
            };

            await _service.UpsertEvaluation(evaluation);

            return Ok(new { message = "Evaluation saved successfully." });
        }

        // Delete an evaluation (only allowed for evaluators)
        [HttpDelete("{taskId:guid}")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> DeleteEvaluation(Guid taskId)
        {
            await _service.DeleteEvaluation(taskId);
            return Ok(new { message = "Evaluation deleted." });
        }

        // Get all tasks pending evaluation (for evaluators)
        [HttpGet("pending")]
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> GetPendingTasks()
        {
            var tasks = await _service.GetPendingTasks();
            return Ok(tasks);
        }

        // Get evaluation history of the current evaluator
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