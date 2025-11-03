using System;

namespace task_manager_api.Models
{
    public enum Role { Admin, Evaluator, Employee }

    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = "";
        public Role Role { get; set; }
        public bool IsEmailVerified { get; set; } = false;

        // 🔢 OTP-related fields
        public string? OtpCode { get; set; }
        public DateTime? OtpExpiresAt { get; set; }
    }
}
