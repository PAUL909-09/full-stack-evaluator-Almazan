using Microsoft.EntityFrameworkCore;
using task_manager_api.Models;
using BCrypt.Net;   // for seeding

namespace task_manager_api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<TaskHistory> TaskHistories { get; set; } = null!;
        public DbSet<ProjectAssignment> ProjectAssignments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -------- Project Relationships --------
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Evaluator)
                .WithMany()
                .HasForeignKey(p => p.EvaluatorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.AssignedTo)
                .WithMany()
                .HasForeignKey(t => t.AssignedToId)
                .OnDelete(DeleteBehavior.Restrict);

            // -------- Evaluation Relationships --------
            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.Task)
                .WithOne(t => t.Evaluation)
                .HasForeignKey<Evaluation>(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            // -------- Task History Relationships --------
            modelBuilder.Entity<TaskHistory>()
                .HasOne(th => th.Task)
                .WithMany(t => t.History)
                .HasForeignKey(th => th.TaskId);

            modelBuilder.Entity<TaskHistory>()
                .HasOne(th => th.PerformedBy)
                .WithMany()
                .HasForeignKey(th => th.PerformedById);

            // -------- Project Assignment Relationships --------
            modelBuilder.Entity<ProjectAssignment>()
                .HasOne(pa => pa.Project)
                .WithMany(p => p.AssignedEmployees)
                .HasForeignKey(pa => pa.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectAssignment>()
                .HasOne(pa => pa.User)
                .WithMany(u => u.AssignedProjects)
                .HasForeignKey(pa => pa.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // -------- Seeding Admin User --------
            var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var adminHash = "$2a$11$AJcog84r2bDESTqn7iI.5eGLKz8/V.8rePpO/E0FMpnROLR5KyTOm"; // bcrypt("adminpassword")

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminId,
                    Name = "Admin User",
                    Email = "admin@example.com",
                    PasswordHash = adminHash,
                    Role = Role.Admin,
                    IsEmailVerified = true,
                    OtpCode = null,
                    OtpExpiresAt = null
                }
            );
        }
    }
}
