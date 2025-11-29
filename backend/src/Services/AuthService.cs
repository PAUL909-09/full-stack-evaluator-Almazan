using task_manager_api.Data;
using task_manager_api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using task_manager_api.Helpers;
using System;
using System.Threading.Tasks;

namespace task_manager_api.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly string _jwtSecret;

        public AuthService(ApplicationDbContext context, EmailService emailService, IConfiguration config)
        {
            _context = context;
            _emailService = emailService;
            _jwtSecret = config["Jwt:Secret"]
                ?? throw new InvalidOperationException("Jwt:Secret not configured");
        }

        // Send invitation with OTP to new user (admin only)
        public async Task<User> InviteUserAsync(string name, string email, Role role)
        {
            var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (existing != null)
                throw new InvalidOperationException("A user with this email already exists.");

            var otp = OtpService.GenerateOtp(6);
            var expiresAt = OtpService.GenerateExpiry(10);

            var user = new User
            {
                Name = name,
                Email = email,
                Role = role,
                IsEmailVerified = false,
                OtpCode = otp,
                OtpExpiresAt = expiresAt,
                PasswordHash = ""
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                email,
                "Verify your account",
                $"Hello {name},<br><br>Your OTP code is: <b>{otp}</b><br>This will expire in 5 minutes.<br><br>- PHIA Evaluator System"
            );

            return user;
        }

        // Verify OTP from invitation email
        public async Task<bool> VerifyOtpAsync(string email, string otp)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return false;
            if (user.IsEmailVerified) return false;
            if (user.OtpCode != otp) return false;

            if (user.OtpExpiresAt == null || OtpService.IsExpired(user.OtpExpiresAt))
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return false;
            }

            user.IsEmailVerified = true;
            user.OtpCode = null;
            user.OtpExpiresAt = null;
            await _context.SaveChangesAsync();
            return true;
        }

        // Set password after successful OTP verification
        public async Task<bool> SetPasswordAsync(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || !user.IsEmailVerified)
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            await _context.SaveChangesAsync();
            return true;
        }

        // Authenticate user and issue access + refresh tokens
        public async Task<(string AccessToken, string RefreshToken)?> Login(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || !user.IsEmailVerified)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;

            var accessToken = JwtTokenHelper.GenerateAccessToken(user, _jwtSecret);
            var refreshToken = JwtTokenHelper.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
            await _context.SaveChangesAsync();

            return (accessToken, refreshToken);
        }

        // Validate user credentials (used by refresh token endpoint)
        public async Task<User?> ValidateUserAsync(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return null;

            bool valid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            return valid ? user : null;
        }
    }
}