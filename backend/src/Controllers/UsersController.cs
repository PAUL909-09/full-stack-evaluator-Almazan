using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public UsersController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET /api/users?role=Employee
        [HttpGet]
        [Authorize(Roles = "Admin,Evaluator")]
        public async Task<IActionResult> GetUsers([FromQuery] string? role)
        {
            var query = _db.Users.AsQueryable();

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role.ToString() == role);

            var users = await query
                .Select(u => new { u.Id, u.Name, u.Email, u.Role })
                .ToListAsync();

            return Ok(users);
        }
    }
}