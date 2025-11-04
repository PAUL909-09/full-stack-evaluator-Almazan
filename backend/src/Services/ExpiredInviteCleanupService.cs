// backend/src/Services/ExpiredInviteCleanupService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using task_manager_api.Data;

namespace task_manager_api.Services
{
    public class ExpiredInviteCleanupService : IHostedService, IDisposable
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ExpiredInviteCleanupService> _logger;
        private Timer? _timer;
        private readonly TimeSpan _interval;

        public ExpiredInviteCleanupService(IServiceScopeFactory scopeFactory, ILogger<ExpiredInviteCleanupService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _interval = TimeSpan.FromMinutes(1); // runs every minute; adjust as needed
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("ExpiredInviteCleanupService started.");
            _timer = new Timer(DoWork, null, TimeSpan.Zero, _interval);
            return Task.CompletedTask;
        }

        private async void DoWork(object? state)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var expired = await db.Users
                    .Where(u => !u.IsEmailVerified && u.OtpExpiresAt != null && u.OtpExpiresAt < DateTime.UtcNow)
                    .ToListAsync();

                if (expired.Count == 0) return;

                db.Users.RemoveRange(expired);
                await db.SaveChangesAsync();

                _logger.LogInformation("ExpiredInviteCleanupService removed {Count} expired invites.", expired.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while cleaning expired invites");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("ExpiredInviteCleanupService stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose() => _timer?.Dispose();
    }
}
