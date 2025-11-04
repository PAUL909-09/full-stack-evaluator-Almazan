using Microsoft.AspNetCore.Mvc;
using task_manager_api.Services;
using task_manager_api.Models;

namespace task_manager_api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // =============================================================
        // 🧩 LOGIN (Employee, Evaluator, or Admin)
        // =============================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var token = await _authService.Login(dto.Email, dto.Password);
            if (token == null)
                return Unauthorized(new { Message = "Invalid credentials or unverified email." });

            return Ok(new { Token = token });
        }

        // // =============================================================
        // 📩 INVITE USER (Admin or Evaluator)
        // =============================================================
        [HttpPost("invite")]
        public async Task<IActionResult> Invite([FromBody] InviteRequestDto dto)  // Changed from InviteDto
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
        // ✅ VERIFY OTP (User enters OTP from email)
        // =============================================================
        // [HttpPost("verify-otp")]
        // public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        // {
        //     var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        //     if (user == null) return BadRequest(new { message = "No pending invite found." });
        //     if (OtpService.IsExpired(user.OtpExpiresAt))
        //     {
        //         _context.Users.Remove(user);
        //         await _context.SaveChangesAsync();
        //         return BadRequest(new { message = "OTP expired. Invite removed. Please ask admin to resend." });
        //     }
        //     var ok = await _authService.VerifyOtpAsync(dto.Email, dto.OtpCode);
        //     if (!ok) return BadRequest(new { message = "Invalid OTP." });
        //     return Ok(new { message = "Verified" });
        // }

        [HttpPost("verify-invite")]
        public async Task<IActionResult> VerifyInvite([FromBody] VerifyInviteDto dto)
        {
            try
            {
                Console.WriteLine($"[VerifyInvite] Email={dto.Email}, OTP={dto.OtpCode}, Password={dto.Password}");

                var ok = await _authService.VerifyOtpAsync(dto.Email, dto.OtpCode);
                if (!ok)
                {
                    Console.WriteLine("[VerifyInvite] Invalid or expired OTP");
                    return BadRequest(new { message = "Invalid or expired OTP." });
                }

                var success = await _authService.SetPasswordAsync(dto.Email, dto.Password);
                if (!success)
                {
                    Console.WriteLine("[VerifyInvite] Password could not be set.");
                    return BadRequest(new { message = "Password could not be set." });
                }

                Console.WriteLine("[VerifyInvite] ✅ Verified successfully");
                return Ok(new { message = "Account verified and password set successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[VerifyInvite] Exception: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }



        // =============================================================
        // 🔑 SET PASSWORD (After OTP verification)
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
        // public record VerifyOtpDto(string Email, string OtpCode);
        public record SetPasswordDto(string Email, string Password);
        public record VerifyInviteDto(string Email, string OtpCode, string Password);

    }
}
