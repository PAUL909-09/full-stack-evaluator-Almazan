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
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly AdminService _adminService;

        public AdminController(AuthService authService, AdminService adminService)
        {
            _authService = authService;
            _adminService = adminService;
        }

        // Get overall analytics for the admin dashboard
        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var data = await _adminService.GetAdminAnalyticsAsync();
            return Ok(data);
        }

        // Send invitation to a new user (name, email, role)
        [HttpPost("invite")]
        public async Task<IActionResult> InviteUser([FromBody] InviteDto dto)
        {
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

        // List all pending (unaccepted) user invitations
        [HttpGet("pending-invites")]
        public async Task<IActionResult> GetPendingInvites()
        {
            var invites = await _adminService.GetPendingInvitesAsync();
            return Ok(invites);
        }

        // Get summary stats for the admin dashboard (users, tasks, etc.)
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var data = await _adminService.GetDashboardStatsAsync();
            return Ok(data);
        }

        // Get analytics data broken down by project
        [HttpGet("projects/analytics")]
        public async Task<IActionResult> GetProjectAnalytics()
        {
            var projects = await _adminService.GetProjectAnalyticsAsync();
            return Ok(projects);
        }

        // DTO for invite endpoint
        public class InviteDto
        {
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
        }
    }
}