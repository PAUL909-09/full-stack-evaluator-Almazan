using Microsoft.AspNetCore.Mvc;
using task_manager_api.Services;
using task_manager_api.Models;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly ApplicationDbContext _context;

        public AdminController(AuthService authService, ApplicationDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        // 📨 POST /api/admin/invite
        [HttpPost("invite")]
        public async Task<IActionResult> InviteUser([FromBody] InviteDto dto)
        {
            try
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
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 📋 GET /api/admin/pending-invites
        [HttpGet("pending-invites")]
        public async Task<IActionResult> GetPendingInvites()
        {
            var users = await _context.Users
                .Where(u => !u.IsEmailVerified)
                .Select(u => new
                {
                    u.Name,
                    u.Email,
                    Role = u.Role.ToString(),
                    u.IsEmailVerified
                })
                .ToListAsync();

            return Ok(users);
        }

        // DTO for invites
        public class InviteDto
        {
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
        }
    }
}
