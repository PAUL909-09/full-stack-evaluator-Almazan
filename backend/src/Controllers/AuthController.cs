using Microsoft.AspNetCore.Mvc;
using task_manager_api.Services;   // <-- correct namespace
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

        // POST api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var token = await _authService.Login(dto.Email, dto.Password);
            if (token == null)
                return Unauthorized("Invalid credentials");

            return Ok(new { Token = token });
        }

        // POST api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var user = await _authService.Register(
                    dto.Name,
                    dto.Email,
                    dto.Password,
                    dto.Role ?? Role.Employee);

                return CreatedAtAction(nameof(Register), new { id = user.Id }, user);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ---------- DTOs ----------
        public record LoginDto(string Email, string Password);
        public record RegisterDto(string Name, string Email, string Password, Role? Role);
    }
}