using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;          // <-- for Include()
using Microsoft.IdentityModel.Tokens;
using task_manager_api.Data;               // <-- ApplicationDbContext
using task_manager_api.Models;
using BCrypt.Net;                            // <-- BCrypt.Net-Next

namespace FullStackEvaluator.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _db;          // <-- correct name
        private readonly string _jwtSecret;
        private readonly int _jwtExpirationMinutes = 60;

        public AuthService(ApplicationDbContext db, IConfiguration config)
        {
            _db = db;
            _jwtSecret = config["Jwt:Secret"]
                ?? throw new InvalidOperationException("Jwt:Secret not configured");
        }

        // --------------------------------------------------------------
        // LOGIN
        // --------------------------------------------------------------
        public async Task<string?> Login(string email, string password)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;   // invalid credentials

            return GenerateJwt(user);
        }

        // --------------------------------------------------------------
        // REGISTER
        // --------------------------------------------------------------
        public async Task<User> Register(string name, string email, string password, Role role = Role.Employee)
        {
            if (await _db.Users.AnyAsync(u => u.Email == email))
                throw new InvalidOperationException("Email already exists");

            if (role == Role.Admin)
                throw new InvalidOperationException("Admin registration not allowed – use seeded admin");

            var user = new User
            {
                Name = name,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = role
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return user;
        }

        // --------------------------------------------------------------
        // PRIVATE: JWT generation
        // --------------------------------------------------------------
        private string GenerateJwt(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtExpirationMinutes),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}