using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using task_manager_api.Services; // Add this if AdminService is in Services namespace

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/admin/analytics")]
    [Authorize(Roles = "Admin")]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly AdminService _adminService;

        public AdminAnalyticsController(ApplicationDbContext db, AdminService adminService)
        {
            _db = db;
            _adminService = adminService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAnalytics()
        {
            return Ok(await _adminService.GetAdminAnalyticsAsync());
        }

        // You can add other methods that use _db if needed
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // Example using _db
            var totalUsers = await _db.Users.CountAsync();
            var totalTasks = await _db.Tasks.CountAsync();
            
            return Ok(new { 
                TotalUsers = totalUsers, 
                TotalTasks = totalTasks 
            });
        }
    }
}