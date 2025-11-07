using Microsoft.EntityFrameworkCore;
using task_manager_api.Data;
using task_manager_api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace task_manager_api.Services.Projects
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _db;

        public ProjectService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Project>> GetAllProjectsAsync()
        {
            return await _db.Projects
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
                .ToListAsync();
        }

        public async Task<Project?> GetProjectByIdAsync(Guid id)
        {
            return await _db.Projects
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Project> CreateProjectAsync(string name, string description, Guid evaluatorId)
        {
            var project = new Project
            {
                Name = name,
                Description = description,
                EvaluatorId = evaluatorId
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();
            return project;
        }

        public async Task<Project?> UpdateProjectAsync(Guid id, string? name, string? description, Guid evaluatorId)
        {
            var project = await _db.Projects.FindAsync(id);
            if (project == null || project.EvaluatorId != evaluatorId)
                return null; // Caller (controller) handles the response

            project.Name = name ?? project.Name;
            project.Description = description ?? project.Description;

            await _db.SaveChangesAsync();
            return project;
        }

        public async Task<bool> DeleteProjectAsync(Guid id, Guid evaluatorId)
        {
            var project = await _db.Projects.FindAsync(id);
            if (project == null || project.EvaluatorId != evaluatorId)
                return false; // Caller handles response

            _db.Projects.Remove(project);
            await _db.SaveChangesAsync();
            return true;
        }

        // In GetUserProjectsAsync
        public async Task<IEnumerable<Project>> GetUserProjectsAsync(Guid userId)
        {
            return await _db.Projects
                .Where(p => p.EvaluatorId == userId || p.Tasks.Any(t => t.AssignedToId == userId))
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                    .ThenInclude(t => t.AssignedTo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Project>> GetProjectsByEvaluatorAsync(Guid evaluatorId)
        {
            return await _db.Projects
                .Where(p => p.EvaluatorId == evaluatorId)
                .Include(p => p.Evaluator)
                .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
                .ToListAsync();
        }
    }
}