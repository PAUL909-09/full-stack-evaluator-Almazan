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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -------- Relationships --------
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

            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.Task)
                .WithOne(t => t.Evaluation)
                .HasForeignKey<Evaluation>(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ensure Evaluation.Task - TaskItem relationship
            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.Task)
                .WithOne(t => t.Evaluation)  // if TaskItem has single Evaluation property
                .HasForeignKey<Evaluation>(e => e.TaskId);

            // TaskHistory relation
            modelBuilder.Entity<TaskHistory>()
                .HasOne(th => th.Task)
                .WithMany(t => t.History) // ensure TaskItem has ICollection<TaskHistory> History {get;set;}
                .HasForeignKey(th => th.TaskId);

            modelBuilder.Entity<TaskHistory>()
                .HasOne(th => th.Task)
                .WithMany(t => t.History)
                .HasForeignKey(th => th.TaskId);

            modelBuilder.Entity<TaskHistory>()
                .HasOne(th => th.PerformedBy)
                .WithMany()
                .HasForeignKey(th => th.PerformedById);

            // -------- Seeding Admin User --------
            var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");

            // Static bcrypt hash for password "adminpassword"
            var adminHash = "$2a$11$AJcog84r2bDESTqn7iI.5eGLKz8/V.8rePpO/E0FMpnROLR5KyTOm";

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminId,
                    Name = "Admin User",
                    Email = "admin@example.com",
                    PasswordHash = adminHash,
                    Role = Role.Admin,
                    IsEmailVerified = true, // ✅ admin is always verified
                    OtpCode = null,
                    OtpExpiresAt = null
                }
            );
        }
    }
}
