using Microsoft.AspNetCore.Mvc;
using task_manager_api.Services;
using task_manager_api.Models;  // Add this line to include the Role enum

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpPost("invite")]
        public async Task<IActionResult> Invite([FromBody] AdminController.InviteDto dto)
        {
            var user = await _adminService.InviteUserAsync(dto.Name, dto.Email, Enum.Parse<Role>(dto.Role));
            return Ok(new { message = "Invite sent", user });
        }

        [HttpGet("pending-invites")]
        public async Task<IActionResult> PendingInvites()
        {
            return Ok(await _adminService.GetPendingInvitesAsync());
        }

        public class InviteDto
        {
            public string Name { get; set; } = "";
            public string Email { get; set; } = "";
            public string Role { get; set; } = "";
        }
    }
}