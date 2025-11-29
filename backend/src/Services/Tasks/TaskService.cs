using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using task_manager_api.Data;
using task_manager_api.Dtos;
using task_manager_api.Models;

namespace task_manager_api.Services.Tasks
{
    using TaskStatus = Models.TaskStatus;

    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _db;

        public TaskService(ApplicationDbContext db) => _db = db;

        // Get all tasks with full details (project, assignee, comments, evaluation)
        public async Task<IEnumerable<TaskItem>> GetAllAsync()
            => await _db.Tasks
                .Include(t => t.Project)
                .Include(t => t.AssignedTo)
                .Include(t => t.Comments)
                .Include(t => t.Evaluation)
                .ToListAsync();

        // Get a single task by ID with all navigation properties
        public async Task<TaskItem?> GetByIdAsync(Guid id)
            => await _db.Tasks
                .Include(t => t.Project)
                .Include(t => t.AssignedTo)
                .Include(t => t.Comments)
                .Include(t => t.Evaluation)
                .FirstOrDefaultAsync(t => t.Id == id);

        // Get all tasks belonging to a specific project
        public async Task<IEnumerable<TaskItem>> GetByProjectAsync(Guid projectId)
            => await _db.Tasks
                .Where(t => t.ProjectId == projectId)
                .Include(t => t.AssignedTo)
                .Include(t => t.Project)
                .ToListAsync();

        // Get all employees assigned to a project (evaluator only)
        public async Task<IEnumerable<User>> GetEmployeesByProjectAsync(Guid projectId, Guid evaluatorId)
        {
            var project = await _db.Projects.FindAsync(projectId);
            if (project == null || project.EvaluatorId != evaluatorId)
                return Enumerable.Empty<User>();

            return await _db.ProjectAssignments
                .Where(pa => pa.ProjectId == projectId)
                .Select(pa => pa.User)
                .Distinct()
                .ToListAsync();
        }

        // Create a new task in evaluator's project with validation and history logging
        public async Task<TaskItem> CreateAsync(CreateTaskDto dto, Guid evaluatorId)
        {
            var evaluator = await _db.Users.FindAsync(evaluatorId);
            var employee = await _db.Users.FindAsync(dto.AssignedToId);
            var project = await _db.Projects.FindAsync(dto.ProjectId);
            if (evaluator == null || employee == null || project == null)
                throw new ArgumentException("Invalid references.");
            if (employee.Role != Role.Employee)
                throw new ArgumentException("Assigned user must be an employee.");
            if (project.EvaluatorId != evaluatorId)
                throw new UnauthorizedAccessException("You can only create tasks for your own projects.");

            bool isAssignedToProject = await _db.ProjectAssignments
                .AnyAsync(pa => pa.ProjectId == dto.ProjectId && pa.UserId == dto.AssignedToId);
            if (!isAssignedToProject)
                throw new ArgumentException("This employee is not assigned to the project.");

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                CreatedById = evaluator.Id,
                AssignedToId = employee.Id,
                ProjectId = project.Id,
                Status = TaskStatus.Todo,
                Deadline = dto.Deadline
            };
            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();
            await LogHistoryAsync(task.Id, "Created", null, evaluatorId);
            return task;
        }

        // Update task status with role-based rules and transition validation
        public async Task<TaskItem?> UpdateStatusAsync(Guid id, TaskStatus newStatus, Guid userId, string role)
        {
            var task = await _db.Tasks
                .Include(t => t.AssignedTo)
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return null;

            bool canUpdate = role switch
            {
                "Employee" => task.AssignedToId == userId,
                "Evaluator" => task.Project.EvaluatorId == userId,
                _ => false
            };

            if (!canUpdate)
                throw new UnauthorizedAccessException("Not authorized to update this task.");

            if (!IsValidStatusTransition(task.Status, newStatus, role))
                throw new InvalidOperationException($"Cannot change status from {task.Status} to {newStatus} as {role}.");

            var oldStatus = task.Status;
            task.Status = newStatus;
            await _db.SaveChangesAsync();

            await LogHistoryAsync(task.Id, $"{oldStatus} to {newStatus}", null, userId);
            return task;
        }

        // Update task details (title, description, assignee, deadline) — evaluator/admin only
        public async Task<TaskItem?> UpdateAsync(Guid id, UpdateTaskDto dto, Guid evaluatorId)
        {
            var task = await _db.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
                return null;

            bool isAdmin = await _db.Users
                .Where(u => u.Id == evaluatorId && u.Role == Role.Admin)
                .AnyAsync();

            if (task.Project.EvaluatorId != evaluatorId && !isAdmin)
                throw new UnauthorizedAccessException("You can only update tasks for projects you own.");

            if (!string.IsNullOrWhiteSpace(dto.Title))
                task.Title = dto.Title;

            if (dto.Description is not null)
                task.Description = dto.Description;

            if (dto.AssignedToId.HasValue)
            {
                var employee = await _db.Users.FindAsync(dto.AssignedToId.Value);
                if (employee == null)
                    throw new ArgumentException("Assigned user not found.");
                if (employee.Role != Role.Employee)
                    throw new ArgumentException("Assigned user must be an employee.");

                task.AssignedToId = employee.Id;
            }

            if (dto.Deadline.HasValue)
                task.Deadline = dto.Deadline;

            await _db.SaveChangesAsync();
            await LogHistoryAsync(task.Id, "Updated", null, evaluatorId);

            await _db.Entry(task).Reference(t => t.AssignedTo).LoadAsync();
            await _db.Entry(task).Reference(t => t.Project).LoadAsync();

            return task;
        }

        // Delete a task — evaluator or admin only
        public async Task<bool> DeleteAsync(Guid id, Guid evaluatorId)
        {
            var task = await _db.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return false;

            bool isAdmin = await _db.Users
                .Where(u => u.Id == evaluatorId && u.Role == Role.Admin)
                .AnyAsync();

            if (task.Project.EvaluatorId != evaluatorId && !isAdmin)
                return false;

            await LogHistoryAsync(task.Id, "Deleted", null, evaluatorId);

            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();

            return true;
        }

        // Log an action in task history
        private async Task LogHistoryAsync(Guid taskId, string action, string? comments, Guid performedById)
        {
            var history = new TaskHistory
            {
                TaskId = taskId,
                Action = action,
                Comments = comments,
                PerformedById = performedById
            };
            _db.TaskHistories.Add(history);
            await _db.SaveChangesAsync();
        }

        // Validate allowed status transitions based on user role
        private static bool IsValidStatusTransition(TaskStatus from, TaskStatus to, string role)
        {
            return (from, to, role) switch
            {
                (_, TaskStatus.InProgress, "Employee") => from == TaskStatus.Todo,
                (_, TaskStatus.Done, "Employee") => from == TaskStatus.InProgress,
                (_, TaskStatus.Submitted, "Employee") => from == TaskStatus.Done,

                (_, TaskStatus.Approved, "Evaluator") => true,
                (_, TaskStatus.NeedsRevision, "Evaluator") => true,
                (_, TaskStatus.Rejected, "Evaluator") => true,

                _ => false
            };
        }
    }
}