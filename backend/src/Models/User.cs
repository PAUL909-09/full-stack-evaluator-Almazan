namespace task_manager_api.Models
{
    public enum Role
    {
        Admin = 0,
        Evaluator = 1,
        Employee = 2
    }

    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public Role Role { get; set; } = Role.Employee;
        public bool IsEmailVerified { get; set; }

        // ✅ For OTP Verification
        public string? OtpCode { get; set; }
        public DateTime? OtpExpiresAt { get; set; }

        // ✅ NEW: Refresh Token Support
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
    }

}
