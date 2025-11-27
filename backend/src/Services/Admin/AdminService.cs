using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;

namespace task_manager_api.Services
{
    public class AdminService
    {
        private readonly ApplicationDbContext _db;
        private readonly AuthService _authService;

        public AdminService(ApplicationDbContext db, AuthService authService)
        {
            _db = db;
            _authService = authService;
        }

        /* ----------------------------------------------------
         * USER MANAGEMENT
        -----------------------------------------------------*/

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _db.Users
                .OrderBy(u => u.Name)
                .ToListAsync();
        }

        public async Task<List<User>> GetUsersByRoleAsync(Role role)
        {
            return await _db.Users
                .Where(u => u.Role == role)
                .OrderBy(u => u.Name)
                .ToListAsync();
        }

        /* ----------------------------------------------------
         * INVITATION HANDLING
        -----------------------------------------------------*/

        public async Task<User> InviteUserAsync(string name, string email, Role role)
        {
            return await _authService.InviteUserAsync(name, email, role);
        }

        public async Task<List<object>> GetPendingInvitesAsync()
        {
            var pendingInvites = await _db.Users
                .Where(u => !u.IsEmailVerified && u.OtpExpiresAt != null && u.OtpExpiresAt > DateTime.UtcNow)
                .Select(u => new
                {
                    u.Name,
                    u.Email,
                    Role = u.Role.ToString(),
                    u.OtpExpiresAt
                })
                .ToListAsync();

            // Convert anonymous types to objects
            return pendingInvites.Cast<object>().ToList();
        }

        /* ----------------------------------------------------
 * ANALYTICS (NO SCORE VERSION)
-----------------------------------------------------*/

        public async Task<object> GetAdminAnalyticsAsync()
        {
            // USER STATISTICS
            var userStats = await _db.Users
                .GroupBy(u => u.Role)
                .Select(g => new
                {
                    role = g.Key.ToString(),
                    count = g.Count()
                })
                .ToListAsync();

            // PROJECT STATISTICS (per evaluator)
            var projectStats = await _db.Projects
                .Include(p => p.Evaluator)
                .GroupBy(p => p.Evaluator!.Name)
                .Select(g => new
                {
                    evaluator = g.Key,
                    projectCount = g.Count()
                })
                .ToListAsync();

            // TASK STATISTICS (count by status)
            var taskStats = await _db.Tasks
                .GroupBy(t => t.Status)
                .Select(g => new
                {
                    status = g.Key.ToString(),
                    count = g.Count()
                })
                .ToListAsync();

            // EVALUATION STATISTICS (group by project, count statuses)
            var evalStatsRaw = await _db.Evaluations
                .Include(e => e.Task)
                .ThenInclude(t => t.Project)
                .GroupBy(e => e.Task!.Project!.Name)
                .Select(g => new
                {
                    project = g.Key,
                    totalEvaluations = g.Count(),
                    approved = g.Count(e => e.Status == EvaluationStatus.Approved),
                    rejected = g.Count(e => e.Status == EvaluationStatus.Rejected),
                    needsRevision = g.Count(e => e.Status == EvaluationStatus.NeedsRevision),
                    pending = g.Count(e => e.Status == EvaluationStatus.Pending)
                })
                .ToListAsync();

            return new
            {
                summary = new
                {
                    totalUsers = await _db.Users.CountAsync(),
                    totalProjects = await _db.Projects.CountAsync(),
                    totalTasks = await _db.Tasks.CountAsync(),
                    totalEvaluations = await _db.Evaluations.CountAsync()
                },
                userStats,
                projectStats,
                taskStats,
                evalStats = evalStatsRaw
            };
        }


        /* ----------------------------------------------------
         * USER-PROJECT RELATIONS
        -----------------------------------------------------*/

        // Admin → see all projects for any user
        public async Task<List<Project>> GetUserProjectsAsync(Guid userId)
        {
            var owned = await _db.Projects
                .Where(p => p.EvaluatorId == userId)
                .ToListAsync();

            var assignedTasks = await _db.Tasks
                .Include(t => t.Project)
                .Where(t => t.AssignedToId == userId)
                .ToListAsync();

            var taskProjects = assignedTasks
                .Select(t => t.Project!)
                .Distinct()
                .ToList();

            return owned.Union(taskProjects).ToList();
        }

        // Admin → view employees inside a project
        public async Task<List<object>> GetEmployeesByProjectAsync(Guid projectId)
        {
            var employees = await _db.Tasks
                .Where(t => t.ProjectId == projectId && t.AssignedTo != null)
                .Select(t => new
                {
                    t.AssignedTo!.Id,
                    t.AssignedTo.Name,
                    t.AssignedTo.Email,
                    Role = t.AssignedTo.Role.ToString(),
                    taskTitle = t.Title
                })
                .Distinct()
                .ToListAsync();

            // Convert anonymous types to objects
            return employees.Cast<object>().ToList();
        }
    }
}