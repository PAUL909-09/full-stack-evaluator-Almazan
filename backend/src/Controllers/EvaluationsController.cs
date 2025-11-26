using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using task_manager_api.Controllers;
using task_manager_api.DTOs.Evaluation;
using task_manager_api.Models;
using task_manager_api.Services;

namespace task_manager_api.Controllers
{
    [Route("api/evaluations")]  // ✅ Explicit route to avoid conflicts
    public class EvaluationsController : BaseApiController
    {
        private readonly IEvaluationService _service;

        public EvaluationsController(IEvaluationService service, IHttpContextAccessor accessor)
            : base(accessor)
        {
            _service = service;
        }

        // --------------------------------------------------------------------
        // Get evaluation for a task
        // --------------------------------------------------------------------
        [HttpGet("{taskId:guid}")]  // ✅ Unique: /api/evaluations/{taskId}
        [Authorize]
        public async Task<IActionResult> GetEvaluation(Guid taskId)
        {
            var evaluation = await _service.GetEvaluationByTaskId(taskId);
            if (evaluation == null) return NotFound();
            return Ok(evaluation);
        }

        // --------------------------------------------------------------------
        // Create evaluation
        // --------------------------------------------------------------------
        [HttpPost]  // ✅ Unique: /api/evaluations (POST)
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> CreateEvaluation([FromBody] EvaluationCreateDto dto)
        {
            var (userId, _) = GetCurrentUser();
            var evaluation = new Evaluation
            {
                TaskId = dto.TaskId,
                Status = dto.Status,
                Comments = dto.Comments,
                EvaluatorId = userId,
                EvaluatedAt = DateTime.UtcNow
            };
            await _service.CreateEvaluation(evaluation);
            return Ok(new { message = "Evaluation created." });
        }

        // --------------------------------------------------------------------
        // Update evaluation
        // --------------------------------------------------------------------
        [HttpPut("{taskId:guid}")]  // ✅ Unique: /api/evaluations/{taskId} (PUT)
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> UpdateEvaluation(Guid taskId, [FromBody] EvaluationUpdateDto dto)
        {
            var (userId, _) = GetCurrentUser();
            var evaluation = new Evaluation
            {
                TaskId = taskId,
                Status = dto.Status,
                Comments = dto.Comments,
                EvaluatorId = userId
            };
            await _service.UpdateEvaluation(evaluation);
            return Ok(new { message = "Evaluation updated." });
        }

        // --------------------------------------------------------------------
        // Delete evaluation
        // --------------------------------------------------------------------
        [HttpDelete("{taskId:guid}")]  // ✅ Unique: /api/evaluations/{taskId} (DELETE)
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> DeleteEvaluation(Guid taskId)
        {
            await _service.DeleteEvaluation(taskId);
            return Ok(new { message = "Evaluation deleted." });
        }

        // --------------------------------------------------------------------
        // Get all submitted tasks for evaluator
        // --------------------------------------------------------------------
        [HttpGet("pending")]  // ✅ Unique: /api/evaluations/pending
        [Authorize(Roles = "Evaluator")]
        public async Task<IActionResult> GetPendingTasks()
        {
            var tasks = await _service.GetPendingTasks();
            return Ok(tasks);
        }
    }
}