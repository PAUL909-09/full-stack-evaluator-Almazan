// backend/src/Services/Admin/AdminService.cs
using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using task_manager_api.Models.DTO;   // <-- FIXED (removed trailing dot)
using System.Linq;
using System.Threading.Tasks;

// Alias needed only to avoid confusion (optional)
using TaskStatusEnum = task_manager_api.Models.TaskStatus;

namespace task_manager_api.Services
{
    public class AdminService
    {
        private readonly ApplicationDbContext _context;

        public AdminService(ApplicationDbContext context)
        {
            _context = context;
        }

        // SIMPLE DASHBOARD SUMMARY
        public async Task<DashboardStats> GetDashboardStatsAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var evaluators = await _context.Users.CountAsync(u => u.Role == Role.Evaluator);
            var employees = await _context.Users.CountAsync(u => u.Role == Role.Employee);
            var projects = await _context.Projects.CountAsync();
            var doneTasks = await _context.Tasks.CountAsync(t => t.Status == TaskStatusEnum.Done);

            return new DashboardStats
            {
                TotalUsers = totalUsers,
                Evaluators = evaluators,
                Employees = employees,
                Projects = projects,
                DoneTasks = doneTasks
            };
        }

        // ADVANCED ANALYTICS
        public async Task<AnalyticsData> GetAnalyticsAsync()
        {
            var userStats = await _context.Users
                .GroupBy(u => u.Role)
                .Select(g => new RoleStatDto
                {
                    Role = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();

            var projectStats = await _context.Projects
                .Where(p => p.Evaluator != null)
                .GroupBy(p => p.Evaluator!.Name)
                .Select(g => new ProjectStatDto
                {
                    Evaluator = g.Key,
                    ProjectCount = g.Count()
                })
                .ToListAsync();

            var taskStats = await _context.Tasks
                .GroupBy(t => t.Status)
                .Select(g => new TaskStatusStatDto
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();

            var evalStats = await _context.Evaluations
                .Include(e => e.Task)
                .ThenInclude(t => t.Project)
                .GroupBy(e => e.Task!.Project!.Name)
                .Select(g => new EvalStatDto
                {
                    Project = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            return new AnalyticsData
            {
                Summary = new SummaryData
                {
                    TotalUsers = await _context.Users.CountAsync(),
                    TotalProjects = await _context.Projects.CountAsync(),
                    TotalTasks = await _context.Tasks.CountAsync(),
                    AvgEvalScore = 0  // You may calculate this later
                },
                UserStats = userStats,
                ProjectStats = projectStats,
                TaskStats = taskStats,
                EvalStats = evalStats
            };
        }

        // PENDING INVITES
        public async Task<List<PendingInvite>> GetPendingInvitesAsync()
        {
            return await _context.Users
                .Where(u => !u.IsEmailVerified && u.OtpExpiresAt != null && u.OtpExpiresAt > DateTime.UtcNow)
                .Select(u => new PendingInvite
                {
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    IsEmailVerified = u.IsEmailVerified,
                    OtpExpiresAt = u.OtpExpiresAt
                })
                .ToListAsync();
        }

        // NEW: MAIN ADMIN ANALYTICS ENDPOINT
        // public async Task<AdminAnalyticsDto> GetAdminAnalyticsAsync()
        // {
        //     return new AdminAnalyticsDto
        //     {
        //         TotalUsers = await _context.Users.CountAsync(),
        //         TotalProjects = await _context.Projects.CountAsync(),
        //         TotalTasks = await _context.Tasks.CountAsync(),

        //         TodoTasks = await _context.Tasks.CountAsync(t => t.Status == TaskStatusEnum.Todo),
        //         InProgressTasks = await _context.Tasks.CountAsync(t => t.Status == TaskStatusEnum.InProgress),
        //         DoneTasks = await _context.Tasks.CountAsync(t => t.Status == TaskStatusEnum.Done),

        //         ApprovedTasks = await _context.Tasks.CountAsync(t => t.Status == TaskStatusEnum.Approved),
        //         NeedsRevisionTasks = await _context.Tasks.CountAsync(t => t.Status == TaskStatusEnum.NeedsRevision),
        //         RejectedTasks = await _context.Tasks.CountAsync(t => t.Status == TaskStatusEnum.Rejected),
        //         SubmittedTasks = await _context.Tasks.CountAsync(t => t.Status == TaskStatusEnum.Submitted)
        //     };
        // }
        public async Task<object> GetAdminAnalyticsAsync()
        {
            var evaluators = await _context.Users
                .Where(u => u.Role == Role.Evaluator)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    AssignedTasks = _context.Tasks.Count(t => t.CreatedById == u.Id),
                    EvaluationsGiven = _context.Evaluations.Count(e => e.EvaluatorId == u.Id),
                })
                .ToListAsync();

            var employees = await _context.Users
                .Where(u => u.Role == Role.Employee)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    TasksAssigned = _context.Tasks.Count(t => t.AssignedToId == u.Id),
                    CompletedTasks = _context.Tasks.Count(t => t.AssignedToId == u.Id && t.Status == TaskStatusEnum.Done),
                    PendingTasks = _context.Tasks.Count(t => t.AssignedToId == u.Id && t.Status != TaskStatusEnum.Done),
                })
                .ToListAsync();

            return new
            {
                summary = new
                {
                    totalUsers = await _context.Users.CountAsync(),
                    totalProjects = await _context.Projects.CountAsync(),
                    totalTasks = await _context.Tasks.CountAsync(),
                    totalEvaluations = await _context.Evaluations.CountAsync()
                },

                userStats = await _context.Users
                    .GroupBy(u => u.Role)
                    .Select(g => new
                    {
                        role = g.Key.ToString(),
                        count = g.Count()
                    })
                    .ToListAsync(),

                projectStats = await _context.Projects
                    .GroupBy(p => p.Name)
                    .Select(g => new
                    {
                        project = g.Key,
                        taskCount = g.Count()
                    })
                    .ToListAsync(),

                taskStats = await _context.Tasks
                    .GroupBy(t => t.Status)
                    .Select(g => new
                    {
                        status = g.Key.ToString(),
                        count = g.Count()
                    })
                    .ToListAsync(),

                evaluationStats = await _context.Evaluations
                    .GroupBy(e => e.Status)
                    .Select(g => new
                    {
                        status = g.Key.ToString(),
                        count = g.Count()
                    })
                    .ToListAsync(),

                evaluatorDetails = evaluators,
                employeeDetails = employees
            };
        }


        // backend/src/Services/Admin/AdminService.cs
        // backend/src/Services/Admin/AdminService.cs

        // backend/src/Services/Admin/AdminService.cs

        public async Task<object> GetProjectAnalyticsAsync()
        {
            var result = await _context.Projects
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                    .ThenInclude(t => t.AssignedTo)
                .Include(p => p.Tasks)
                    .ThenInclude(t => t.Evaluation)
                .Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    createdBy = p.Evaluator.Name,
                    createdByEmail = p.Evaluator.Email,
                    totalTasks = p.Tasks.Count,
                    todo = p.Tasks.Count(t => t.Status == TaskStatusEnum.Todo),
                    inProgress = p.Tasks.Count(t => t.Status == TaskStatusEnum.InProgress),
                    done = p.Tasks.Count(t => t.Status == TaskStatusEnum.Done),
                    submitted = p.Tasks.Count(t => t.Status == TaskStatusEnum.Submitted),
                    approved = p.Tasks.Count(t => t.Evaluation != null && t.Evaluation.Status == EvaluationStatus.Approved),
                    needsRevision = p.Tasks.Count(t => t.Evaluation != null && t.Evaluation.Status == EvaluationStatus.NeedsRevision),
                    rejected = p.Tasks.Count(t => t.Evaluation != null && t.Evaluation.Status == EvaluationStatus.Rejected),
                    topPerformer = p.Tasks
                        .Where(t => t.Evaluation != null && t.Evaluation.Status == EvaluationStatus.Approved)
                        .GroupBy(t => t.AssignedTo!.Name)
                        .OrderByDescending(g => g.Count())
                        .Select(g => g.Key)
                        .FirstOrDefault() ?? "None"
                })
                .ToListAsync();

            return result; // List<anonymous> → object → JSON array automatically
        }
    }

    // DTO classes used inside this service
    public class RoleStatDto { public string Role { get; set; } = ""; public int Count { get; set; } }
    public class ProjectStatDto { public string Evaluator { get; set; } = ""; public int ProjectCount { get; set; } }
    public class TaskStatusStatDto { public string Status { get; set; } = ""; public int Count { get; set; } }
    public class EvalStatDto { public string Project { get; set; } = ""; public int Count { get; set; } }

    public class DashboardStats
    {
        public int TotalUsers { get; set; }
        public int Evaluators { get; set; }
        public int Employees { get; set; }
        public int Projects { get; set; }
        public int DoneTasks { get; set; }
    }

    public class SummaryData
    {
        public int TotalUsers { get; set; }
        public int TotalProjects { get; set; }
        public int TotalTasks { get; set; }
        public double AvgEvalScore { get; set; }
    }

    public class AnalyticsData
    {
        public SummaryData Summary { get; set; } = new();
        public List<RoleStatDto> UserStats { get; set; } = new();
        public List<ProjectStatDto> ProjectStats { get; set; } = new();
        public List<TaskStatusStatDto> TaskStats { get; set; } = new();
        public List<EvalStatDto> EvalStats { get; set; } = new();
    }

    public class PendingInvite
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Role { get; set; } = "";
        public bool IsEmailVerified { get; set; }
        public DateTime? OtpExpiresAt { get; set; }
    }
}
