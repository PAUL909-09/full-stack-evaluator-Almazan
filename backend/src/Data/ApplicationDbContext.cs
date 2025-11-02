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

            // Static (pre-generated) BCrypt password hashes (use 'dotnet script' or online tool to generate new ones)
            var adminHash     = "$2a$11$AJcog84r2bDESTqn7iI.5eGLKz8/V.8rePpO/E0FMpnROLR5KyTOm"; // for "adminpassword"
          
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminId,
                    Name = "Admin User",
                    Email = "admin@example.com",
                    PasswordHash = adminHash,
                    Role = Role.Admin
                });           
        }
    }
}
