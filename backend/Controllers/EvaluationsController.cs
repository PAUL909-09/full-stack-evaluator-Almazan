using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using task_manager_api.Data;
using System.Security.Claims;
using task_manager_api.Models;

[ApiController]
[Route("api/tasks/{taskId}/[controller]")]
[Authorize]
public class EvaluationsController : ControllerBase { // Or EvaluateController
    private readonly ApplicationDbContext _db; // Assume injected

    public EvaluationsController(ApplicationDbContext db) { _db = db; }

    [HttpPost]
    [Authorize(Roles = "Evaluator")] // Only evaluators can evaluate
    public async Task<IActionResult> Evaluate(Guid taskId, [FromBody] EvalDto dto) {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (dto.EvaluatorId != userId) return BadRequest("Can only evaluate as self");

        // Implementation: Add evaluation, etc.
        var eval = new Evaluation { /* Map dto */ };
        await _db.Evaluations.AddAsync(eval);
        await _db.SaveChangesAsync();
        return Ok();
    }
}

public record EvalDto(Guid EvaluatorId /* other fields */);