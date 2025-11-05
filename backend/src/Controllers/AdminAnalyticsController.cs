using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/admin/analytics")]
    [Authorize(Roles = "Admin")]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public AdminAnalyticsController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAnalytics()
        {
            // 🧍 User Distribution by Role
            var userStats = await _db.Users
                .GroupBy(u => u.Role)
                .Select(g => new { role = g.Key.ToString(), count = g.Count() })
                .ToListAsync();

            // 📊 Projects per Evaluator
            var projectStats = await _db.Projects
                .GroupBy(p => p.Evaluator!.Name)
                .Select(g => new { evaluator = g.Key, projectCount = g.Count() })
                .ToListAsync();

            // ✅ Task Status Breakdown
            var taskStats = await _db.Tasks
                .GroupBy(t => t.Status)
                .Select(g => new { status = g.Key.ToString(), count = g.Count() })
                .ToListAsync();

            // 🌟 Average Evaluation per Project
            var evalStats = await _db.Evaluations
                .Include(e => e.Task)
                .ThenInclude(t => t.Project)
                .GroupBy(e => e.Task!.Project!.Name)
                .ToListAsync();

            var summary = new
            {
                TotalUsers = await _db.Users.CountAsync(),
                TotalProjects = await _db.Projects.CountAsync(),
                TotalTasks = await _db.Tasks.CountAsync(),
            };

            return Ok(new
            {
                summary,
                userStats,
                projectStats,
                taskStats,
                evalStats
            });
        }
    }
}
