using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using task_manager_api.Helpers;
using task_manager_api.Models;
using task_manager_api.Data;


namespace task_manager_api.Controllers.Auth
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public class RefreshRequest
        {
            public string RefreshToken { get; set; } = string.Empty;
        }

        [HttpPost("refresh")]
        public IActionResult Refresh([FromBody] RefreshRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
                return BadRequest(new { message = "Refresh token is required." });

            var user = _context.Users.SingleOrDefault(u =>
                u.RefreshToken == request.RefreshToken &&
                u.RefreshTokenExpiry.HasValue &&
                u.RefreshTokenExpiry > DateTime.UtcNow
            );

            if (user == null)
                return Unauthorized(new { message = "Invalid or expired refresh token." });

            var secret = _config["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT secret not configured");

            var newAccessToken = JwtTokenHelper.GenerateAccessToken(user, secret);

            // Rotate refresh token for security
            user.RefreshToken = JwtTokenHelper.GenerateRefreshToken();
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
            _context.SaveChanges();

            return Ok(new
            {
                accessToken = newAccessToken,
                refreshToken = user.RefreshToken
            });
        }
    }
}
