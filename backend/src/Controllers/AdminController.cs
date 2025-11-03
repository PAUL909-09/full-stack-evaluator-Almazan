using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public AdminController(ApplicationDbContext db) => _db = db;

        [HttpGet("pending-users")]
        public async Task<IActionResult> GetPendingUsers()
        {
            var pending = await _db.Users
                .Where(u => !u.IsEmailVerified && u.Role != Role.Admin)
                .Select(u => new { u.Id, u.Name, u.Email, u.Role })
                .ToListAsync();
            return Ok(pending);
        }

        [HttpPost("verify/{userId}")]
        public async Task<IActionResult> VerifyUser(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null || user.IsEmailVerified) return NotFound("User not found or already verified");
            user.IsEmailVerified = true;
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}