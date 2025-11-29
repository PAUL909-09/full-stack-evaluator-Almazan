// backend/src/Controllers/DashboardController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using task_manager_api.Services;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize(Roles = "Admin")] // Only admins can access dashboard
    public class DashboardController : ControllerBase
    {
        private readonly AdminService _adminService;

        public DashboardController(AdminService adminService)
        {
            _adminService = adminService;
        }

        // Get key statistics for the admin dashboard (users, projects, tasks)
        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var stats = await _adminService.GetDashboardStatsAsync();
            return Ok(new
            {
                totalUsers = stats.TotalUsers,
                evaluators = stats.Evaluators,
                employees = stats.Employees,
                projects = stats.Projects,
                doneTasks = stats.DoneTasks
            });
        }
    }
}