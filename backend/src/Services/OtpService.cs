using System;

namespace task_manager_api.Services
{
    public static class OtpService
    {
        private static readonly Random _random = new();

        public static string GenerateOtp()
        {
            // 6-digit alphanumeric OTP
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }

        public static DateTime GenerateExpiry()
        {
            return DateTime.UtcNow.AddMinutes(5); // 5 minutes validity
        }

        public static bool IsExpired(DateTime? expiry)
        {
            return !expiry.HasValue || DateTime.UtcNow > expiry.Value;
        }
    }
}
