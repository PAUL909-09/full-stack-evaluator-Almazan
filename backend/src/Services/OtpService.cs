// backend/src/Services/OtpService.cs
using System;

namespace task_manager_api.Services
{
    /// <summary>
    /// Utility class for generating and validating OTPs used in user invitation flow
    /// </summary>
    public static class OtpService
    {
        private static readonly Random _random = new();

        // Generate a random alphanumeric OTP of specified length (default 6)
        public static string GenerateOtp(int length = 6)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }

        // Generate OTP expiry timestamp (default 10 minutes from now)
        public static DateTime GenerateExpiry(int minutes = 10)
        {
            return DateTime.UtcNow.AddMinutes(minutes);
        }

        // Check if an OTP has expired based on its expiry timestamp
        public static bool IsExpired(DateTime? expiry)
        {
            return !expiry.HasValue || DateTime.UtcNow > expiry.Value;
        }
    }
}