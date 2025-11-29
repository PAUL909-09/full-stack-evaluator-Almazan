using Microsoft.EntityFrameworkCore;
using task_manager_api.Models;
using task_manager_api.Data;

namespace task_manager_api.Services.Projects
{
    public interface IProjectAssignmentService
    {
        Task<IEnumerable<ProjectAssignment>> GetAllAsync();
        Task<ProjectAssignment?> GetByIdAsync(Guid id);
        Task<ProjectAssignment> CreateAsync(Guid projectId, Guid userId);
        Task<ProjectAssignment?> UpdateAsync(Guid id, Guid projectId, Guid userId);
        Task<bool> DeleteAsync(Guid id);
    }

    public class ProjectAssignmentService : IProjectAssignmentService
    {
        private readonly ApplicationDbContext _context;

        public ProjectAssignmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all project-employee assignments with user and project details
        public async Task<IEnumerable<ProjectAssignment>> GetAllAsync()
        {
            return await _context.ProjectAssignments
                .Include(pa => pa.User)
                .Include(pa => pa.Project)
                .ToListAsync();
        }

        // Get a single assignment by ID with related user and project
        public async Task<ProjectAssignment?> GetByIdAsync(Guid id)
        {
            return await _context.ProjectAssignments
                .Include(pa => pa.User)
                .Include(pa => pa.Project)
                .FirstOrDefaultAsync(pa => pa.Id == id);
        }

        // Assign an employee to a project
        public async Task<ProjectAssignment> CreateAsync(Guid projectId, Guid userId)
        {
            var assignment = new ProjectAssignment
            {
                ProjectId = projectId,
                UserId = userId
            };

            _context.ProjectAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return assignment;
        }

        // Update an existing project assignment (reassign user or project)
        public async Task<ProjectAssignment?> UpdateAsync(Guid id, Guid projectId, Guid userId)
        {
            var assignment = await _context.ProjectAssignments.FindAsync(id);
            if (assignment == null)
                return null;

            assignment.ProjectId = projectId;
            assignment.UserId = userId;
            await _context.SaveChangesAsync();

            return assignment;
        }

        // Remove an employee from a project
        public async Task<bool> DeleteAsync(Guid id)
        {
            var assignment = await _context.ProjectAssignments.FindAsync(id);
            if (assignment == null)
                return false;

            _context.ProjectAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}