using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using task_manager_api.DTOs.Users;
using task_manager_api.DTOs.Projects;

namespace task_manager_api.Services.Projects
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _db;

        public ProjectService(ApplicationDbContext db)
        {
            _db = db;
        }

        // Get all projects with evaluator and task details
        public async Task<IEnumerable<Project>> GetAllProjectsAsync()
        {
            return await _db.Projects
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
                .ToListAsync();
        }

        // Get a single project by ID with full details
        public async Task<Project?> GetProjectByIdAsync(Guid id)
        {
            return await _db.Projects
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        // Create a new project for the given evaluator
        public async Task<Project> CreateProjectAsync(string name, string? description, Guid evaluatorId, DateTime? deadline = null)
        {
            var project = new Project
            {
                Name = name,
                Description = description,
                EvaluatorId = evaluatorId,
                Deadline = deadline
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();
            return project;
        }

        // Update project details (name, description, deadline) — evaluator only
        public async Task<Project?> UpdateProjectAsync(Guid id, string? name, string? description, Guid evaluatorId, DateTime? deadline = null)
        {
            var project = await _db.Projects.FindAsync(id);
            if (project == null || project.EvaluatorId != evaluatorId)
                return null;

            if (name != null) project.Name = name;
            if (description != null) project.Description = description;
            if (deadline.HasValue) project.Deadline = deadline;

            await _db.SaveChangesAsync();
            return project;
        }

        // Delete a project — evaluator only
        public async Task<bool> DeleteProjectAsync(Guid id, Guid evaluatorId)
        {
            var project = await _db.Projects.FindAsync(id);
            if (project == null || project.EvaluatorId != evaluatorId)
                return false;

            _db.Projects.Remove(project);
            await _db.SaveChangesAsync();
            return true;
        }

        // Get all projects the user is involved in (as evaluator or assigned employee)
        public async Task<IEnumerable<Project>> GetUserProjectsAsync(Guid userId)
        {
            return await _db.Projects
                .Where(p => p.EvaluatorId == userId || p.Tasks.Any(t => t.AssignedToId == userId))
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                    .ThenInclude(t => t.AssignedTo)
                .ToListAsync();
        }

        // Get all projects owned by a specific evaluator
        public async Task<IEnumerable<Project>> GetProjectsByEvaluatorAsync(Guid evaluatorId)
        {
            return await _db.Projects
                .Where(p => p.EvaluatorId == evaluatorId)
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
                .ToListAsync();
        }

        // Assign/replace employees to a project (admin or project evaluator only)
        public async Task<bool> AssignEmployeesAsync(Guid projectId, List<Guid> employeeIds, Guid currentUserId)
        {
            var project = await _db.Projects
                .Include(p => p.AssignedEmployees)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null)
                return false;

            var currentUser = await _db.Users.FindAsync(currentUserId);
            var isAdmin = currentUser?.Role == Role.Admin;

            if (!isAdmin && project.EvaluatorId != currentUserId)
                return false;

            _db.ProjectAssignments.RemoveRange(project.AssignedEmployees);

            foreach (var empId in employeeIds.Distinct())
            {
                var employee = await _db.Users.FindAsync(empId);
                if (employee == null || employee.Role != Role.Employee)
                    continue;

                _db.ProjectAssignments.Add(new ProjectAssignment
                {
                    ProjectId = projectId,
                    UserId = empId
                });
            }

            await _db.SaveChangesAsync();
            return true;
        }

        // Get all employees currently assigned to a project
        public async Task<IEnumerable<EmployeeDto>> GetAssignedEmployeesAsync(Guid projectId)
        {
            var employees = await _db.ProjectAssignments
                .Where(a => a.ProjectId == projectId)
                .Include(a => a.User)
                .Select(a => new EmployeeDto(
                    a.User.Id,
                    a.User.Name,
                    a.User.Email))
                .ToListAsync();

            return employees;
        }

        // Get all projects a specific user is involved in (admin view)
        public async Task<List<Project>> GetProjectsForUserAsync(Guid userId)
        {
            return await _db.Projects
                .Include(p => p.Tasks)
                .Where(p =>
                    p.EvaluatorId == userId ||
                    p.Tasks.Any(t => t.AssignedToId == userId))
                .ToListAsync();
        }

        // Get all tasks in a specific project (with assignee)
        public async Task<List<TaskItem>> GetTasksForProjectAsync(Guid projectId)
        {
            return await _db.Tasks
                .Include(t => t.AssignedTo)
                .Where(t => t.ProjectId == projectId)
                .ToListAsync();
        }

        // Mark a project as completed (evaluator only, idempotent)
        public async Task<bool> CompleteProjectAsync(Guid projectId, Guid evaluatorId)
        {
            var project = await _db.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.EvaluatorId == evaluatorId);

            if (project == null)
                return false;

            if (project.Status == "Completed")
                return true;

            project.Status = "Completed";
            await _db.SaveChangesAsync();
            return true;
        }
    }
}