using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using task_manager_api.Data;
using task_manager_api.Models;
using task_manager_api.Dtos.Employee;

namespace task_manager_api.Services.Employees
{
    public class EmployeeTaskService : IEmployeeTaskService
    {
        private readonly ApplicationDbContext _db;

        public EmployeeTaskService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<EmployeeTaskDto>> GetMyTasksAsync(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
                throw new UnauthorizedAccessException();

            var tasks = await _db.Tasks
                .Where(t => t.AssignedToId == currentUserId)
                .Include(t => t.Project)
                .Include(t => t.Evaluation)
                .ToListAsync();

            return tasks.Select(t => new EmployeeTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status.ToString(),
                Deadline = t.Deadline,
                SubmittedAt = t.SubmittedAt,
                ProofFilePath = t.ProofFilePath,
                ProjectName = t.Project?.Name,

                Evaluation = t.Evaluation != null ? new TaskEvaluationDto
                {
                    Status = t.Evaluation.Status.ToString(),
                    Comments = t.Evaluation.Comments,
                    EvaluatedAt = t.Evaluation.EvaluatedAt
                } : null
            });
        }
    }
}
