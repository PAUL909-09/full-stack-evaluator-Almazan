using task_manager_api.Data;
using task_manager_api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using task_manager_api.Helpers;
using System;
using BCrypt.Net;

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

        // 1️⃣ ADMIN INVITES A USER (SENDS OTP)
        public async Task<User> InviteUserAsync(string name, string email, Role role)
        {
            var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (existing != null)
                throw new InvalidOperationException("A user with this email already exists.");

            var otp = OtpService.GenerateOtp();
            var expiresAt = OtpService.GenerateExpiry();

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

            await _emailService.SendEmailAsync(email, "Verify your account",
                $"Hello {name},<br><br>Your OTP code is: <b>{otp}</b><br>This will expire in 5 minutes.<br><br>- PHIA Evaluator System");

            return user;
        }

        // 2️⃣ VERIFY OTP
        public async Task<bool> VerifyOtpAsync(string email, string otp)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || user.OtpCode != otp || OtpService.IsExpired(user.OtpExpiresAt))
                return false;

            user.IsEmailVerified = true;
            user.OtpCode = null;
            user.OtpExpiresAt = null;

            await _context.SaveChangesAsync();
            return true;
        }

        // 3️⃣ SET PASSWORD
        public async Task<bool> SetPasswordAsync(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || !user.IsEmailVerified)
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            await _context.SaveChangesAsync();
            return true;
        }

        // 4️⃣ LOGIN
        public async Task<string?> Login(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || !user.IsEmailVerified)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;

            return JwtTokenHelper.GenerateJwtToken(user, _jwtSecret);
        }
    }
}
