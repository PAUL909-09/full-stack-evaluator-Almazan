using Microsoft.EntityFrameworkCore;
using task_manager_api.Models;
using BCrypt.Net;   // for seeding

// Alias for our enum (avoids clash with System.Threading.Tasks.TaskStatus)
using ModelTaskStatus = task_manager_api.Models.TaskStatus;

namespace task_manager_api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        // DbSets
        public DbSet<User> Users => Set<User>();
        public DbSet<TaskItem> Tasks => Set<TaskItem>();
        public DbSet<Evaluation> Evaluations => Set<Evaluation>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ---- Indexes & precision ------------------------------------------------
            modelBuilder.Entity<User>()
                        .HasIndex(u => u.Email)
                        .IsUnique();

            modelBuilder.Entity<TaskItem>()
                        .Property(t => t.Score)
                        .HasPrecision(5, 2);

            modelBuilder.Entity<Evaluation>()
                        .Property(e => e.Score)
                        .HasPrecision(5, 2);

            // ---- Relationships ------------------------------------------------------
            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.AssignedUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedTo)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.Task)
                .WithMany()
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.Evaluator)
                .WithMany()
                .HasForeignKey(e => e.EvaluatorId)
                .OnDelete(DeleteBehavior.Restrict);

            // ---- Seeding (STATIC GUIDS + STATIC PASSWORD HASHES) --------------------
            var adminId      = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var evaluatorId  = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var employeeId   = Guid.Parse("33333333-3333-3333-3333-333333333333");
            var sampleTaskId = Guid.Parse("44444444-4444-4444-4444-444444444444");

            // Static (pre-generated) BCrypt password hashes (use 'dotnet script' or online tool to generate new ones)
            var adminHash     = "$2a$11$AJcog84r2bDESTqn7iI.5eGLKz8/V.8rePpO/E0FMpnROLR5KyTOm"; // for "adminpassword"
            var evaluatorHash = "$2a$11$BMyhxw8kJXMWxp7YdageUOQBXPsk5I3BfOEoHo7OrGcGLS9fQPOmy"; // for "evalpass"
            var employeeHash  = "$2a$11$WBWqeQ.RX2e0SJf0KJFU0eHPU0YbTvhYD8NYX8QR8gVhwFONuo3nW"; // for "employeepass"

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminId,
                    Name = "Admin User",
                    Email = "admin@example.com",
                    PasswordHash = adminHash,
                    Role = Role.Admin
                },
                new User
                {
                    Id = evaluatorId,
                    Name = "Evaluator User",
                    Email = "evaluator@example.com",
                    PasswordHash = evaluatorHash,
                    Role = Role.Evaluator
                },
                new User
                {
                    Id = employeeId,
                    Name = "Employee User",
                    Email = "employee@example.com",
                    PasswordHash = employeeHash,
                    Role = Role.Employee
                });

            // ---- Sample Task ---------------------------------------------------------
            modelBuilder.Entity<TaskItem>().HasData(
                new TaskItem
                {
                    Id = sampleTaskId,
                    Title = "Sample Task – finish the report",
                    IsDone = false,
                    Status = ModelTaskStatus.Pending,
                    Score = 0m
                });
        }
    }
}
