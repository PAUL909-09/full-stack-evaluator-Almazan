using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
// ✅ Prevents conflict with System.Threading.Tasks.TaskStatus
using TaskStatus = task_manager_api.Models.TaskStatus;
namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public DashboardController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetStats()
        {
            var stats = new
            {
                TotalUsers = await _db.Users.CountAsync(),
                Evaluators = await _db.Users.CountAsync(u => u.Role == Role.Evaluator),
                Employees = await _db.Users.CountAsync(u => u.Role == Role.Employee),

                Projects = await _db.Projects.CountAsync(),
                Tasks = await _db.Tasks.CountAsync(),
                DoneTasks = await _db.Tasks.CountAsync(t => t.Status == TaskStatus.Done),

                Evaluations = await _db.Evaluations.CountAsync(),
                AverageScore = await _db.Evaluations.AnyAsync()
                    ? await _db.Evaluations.AverageAsync(e => e.Score)
                    : 0
            };

            return Ok(stats);
        }
    }
}
