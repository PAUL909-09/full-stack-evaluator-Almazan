using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using task_manager_api.Services;
using task_manager_api.Models;
using task_manager_api.Helpers;
using task_manager_api.Data;


namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AuthService authService, ApplicationDbContext context, IConfiguration config)
        {
            _authService = authService;
            _context = context;
            _config = config;
        }

        // =============================================================
        // 🧩 LOGIN
        // =============================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials or unverified email." });

            var secret = _config["Jwt:Secret"]
                ?? throw new InvalidOperationException("JWT secret not configured");

            var accessToken = JwtTokenHelper.GenerateAccessToken(user, secret);
            var refreshToken = JwtTokenHelper.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                accessToken,
                refreshToken,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.Role
                }
            });
        }


        // =============================================================
        // 📩 INVITE USER
        // =============================================================
        [HttpPost("invite")]
        public async Task<IActionResult> Invite([FromBody] InviteRequestDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Email))
                    return BadRequest(new { Message = "Email is required." });

                var name = dto.Name ?? "Invited User";
                var role = dto.Role ?? Role.Employee;

                var user = await _authService.InviteUserAsync(name, dto.Email, role);
                return Ok(new
                {
                    Message = $"Invite sent to {dto.Email}. OTP valid for 10 minutes.",
                    user.Email,
                    Role = user.Role.ToString()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // =============================================================
        // 🧩 VERIFY INVITE
        // =============================================================
        [HttpPost("verify-invite")]
        public async Task<IActionResult> VerifyInvite([FromBody] VerifyInviteDto dto)
        {
            try
            {
                var ok = await _authService.VerifyOtpAsync(dto.Email, dto.OtpCode);
                if (!ok)
                    return BadRequest(new { message = "Invalid or expired OTP." });

                var success = await _authService.SetPasswordAsync(dto.Email, dto.Password);
                if (!success)
                    return BadRequest(new { message = "Password could not be set." });

                return Ok(new { message = "Account verified and password set successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // =============================================================
        // 🔑 SET PASSWORD
        // =============================================================
        [HttpPost("set-password")]
        public async Task<IActionResult> SetPassword([FromBody] SetPasswordDto dto)
        {
            var success = await _authService.SetPasswordAsync(dto.Email, dto.Password);
            if (!success)
                return BadRequest(new { Message = "User not found or not verified." });

            return Ok(new { Message = "Password set successfully. You may now log in." });
        }

        // =============================================================
        // DTOs
        // =============================================================
        public record LoginDto(string Email, string Password);
        public record InviteRequestDto(string? Name, string Email, Role? Role);
        public record VerifyInviteDto(string Email, string OtpCode, string Password);
        public record SetPasswordDto(string Email, string Password);
    }
}
