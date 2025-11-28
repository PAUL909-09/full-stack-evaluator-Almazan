// backend/src/Controllers/AdminController.cs
using Microsoft.AspNetCore.Mvc;
using task_manager_api.Services;
using task_manager_api.Models;
using Microsoft.AspNetCore.Authorization;
using TaskStatus = task_manager_api.Models.TaskStatus;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")] // Restrict to admins
    public class AdminController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly AdminService _adminService;

        public AdminController(AuthService authService, AdminService adminService)
        {
            _authService = authService;
            _adminService = adminService;
        }

        // GET /api/admin/analytics
        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var data = await _adminService.GetAdminAnalyticsAsync();
            return Ok(data);
        }

        // 📨 POST /api/admin/invite
        [HttpPost("invite")]
        public async Task<IActionResult> InviteUser([FromBody] InviteDto dto)
        {
            // Logic unchanged, but now consistent with service pattern
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Name))
                return BadRequest(new { message = "Name and Email are required." });

            if (!Enum.TryParse<Role>(dto.Role, true, out var role))
                return BadRequest(new { message = "Invalid role specified." });

            var user = await _authService.InviteUserAsync(dto.Name, dto.Email, role);

            return Ok(new
            {
                message = "Invite sent successfully.",
                user.Email,
                user.Role
            });
        }

        // 📋 GET /api/admin/pending-invites
        [HttpGet("pending-invites")]
        public async Task<IActionResult> GetPendingInvites()
        {
            var invites = await _adminService.GetPendingInvitesAsync();
            return Ok(invites);
        }

        // GET /api/admin/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var data = await _adminService.GetDashboardStatsAsync();
            return Ok(data);
        }


        [HttpGet("projects/analytics")]
        public async Task<IActionResult> GetProjectAnalytics()
        {
            var projects = await _adminService.GetProjectAnalyticsAsync();
            return Ok(projects);
        }
        // DTO for invites (unchanged)
        public class InviteDto
        {
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
        }
    }
}