using Microsoft.EntityFrameworkCore;
using task_manager_api.Models;
using BCrypt.Net;   // for seeding

// <-- Add the alias here
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

            // ---- Seeding ------------------------------------------------------------
            var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var adminHash = BCrypt.Net.BCrypt.HashPassword("adminpassword"); // change in prod!

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminId,
                    Name = "Admin User",
                    Email = "admin@example.com",
                    PasswordHash = adminHash,
                    Role = Role.Admin
                });

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Evaluator User",
                    Email = "evaluator@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("evalpass"),
                    Role = Role.Evaluator
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Employee User",
                    Email = "employee@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("employeepass"),
                    Role = Role.Employee
                });

            // Sample task (unassigned) – use the alias
            modelBuilder.Entity<TaskItem>().HasData(
                new TaskItem
                {
                    Id = Guid.NewGuid(),
                    Title = "Sample Task – finish the report",
                    IsDone = false,
                    Status = ModelTaskStatus.Pending,   // <-- fixed
                    Score = 0m
                });
        }
    }
}