// backend/src/Controllers/UsersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using System.Security.Claims;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize] // All endpoints require authentication
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string CurrentUserRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";

        // Get users filtered by role (e.g., ?role=Employee) — Admin & Evaluator only
        [HttpGet]
        public async Task<IActionResult> GetUsersByRole([FromQuery] string? role)
        {
            if (string.IsNullOrEmpty(role))
                return BadRequest(new { message = "Role query parameter is required." });

            if (CurrentUserRole is not ("Admin" or "Evaluator"))
                return Forbid();

            var users = await _context.Users
                .Where(u => u.Role.ToString() == role)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email
                })
                .ToListAsync();

            return Ok(users);
        }

        // Get public profile of a specific user by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    Role = u.Role.ToString(),
                    u.IsEmailVerified
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found." });

            return Ok(user);
        }
    }
}