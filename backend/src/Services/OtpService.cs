// backend/src/Services/OtpService.cs
using System;

namespace task_manager_api.Services
{
    public static class OtpService
    {
        private static readonly Random _random = new();

        public static string GenerateOtp(int length = 6)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }

        public static DateTime GenerateExpiry(int minutes = 10)
        {
            return DateTime.UtcNow.AddMinutes(minutes);
        }

        public static bool IsExpired(DateTime? expiry)
        {
            return !expiry.HasValue || DateTime.UtcNow > expiry.Value;
        }
    }
}
