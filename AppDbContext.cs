using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.Models;

namespace ProjectManagement.API
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> Tasks { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<TaskHistory> TaskHistories { get; set; }
        public DbSet<TaskTimeLog> TaskTimeLogs { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>()
        .HasIndex(u => u.Email)
        .IsUnique();

        modelBuilder.Entity<User>()
        .Property(u => u.Email)
        .UseCollation("NOCASE");

        modelBuilder.Entity<ProjectMember>()
        .HasIndex(pm => new { pm.ProjectId, pm.UserId })
        .IsUnique();

        modelBuilder.Entity<User>()
        .Property(u => u.FirstName)
        .HasMaxLength(50)
        .IsRequired();

        modelBuilder.Entity<User>()
        .Property(u => u.LastName)
        .HasMaxLength(50)
        .IsRequired();

        modelBuilder.Entity<User>()
        .Property(u => u.Email)
        .HasMaxLength(200)
        .IsRequired()
        .UseCollation("NOCASE");

        modelBuilder.Entity<User>()
        .Property(u => u.PasswordHash)
        .IsRequired();

        modelBuilder.Entity<User>()
        .Property(u => u.Department)
        .HasMaxLength(100);

        modelBuilder.Entity<Project>()
        .Property(p => p.Name)
        .HasMaxLength(200)
        .IsRequired();

        modelBuilder.Entity<ProjectTask>()
        .Property(t => t.Title)
        .HasMaxLength(200)
        .IsRequired();

        modelBuilder.Entity<Comment>()
        .Property(c => c.Content)
        .IsRequired();

        modelBuilder.Entity<TaskTimeLog>()
        .Property(tl => tl.Description)
        .HasMaxLength(500);

        modelBuilder.Entity<ProjectTask>()
        .Property(t => t.EstimatedHours)
        .HasPrecision(8, 2);

        modelBuilder.Entity<TaskTimeLog>()
        .Property(tl => tl.Hours)
        .HasPrecision(8, 2);

        modelBuilder.Entity<Project>()
        .HasOne(p => p.Owner)
        .WithMany()
        .HasForeignKey(p => p.OwnerId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectMember>()
        .HasOne(pm => pm.Project)
        .WithMany()
        .HasForeignKey(pm => pm.ProjectId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectMember>()
        .HasOne(pm => pm.User)
        .WithMany()
        .HasForeignKey(pm => pm.UserId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTask>()
        .HasOne(t => t.Project)
        .WithMany()
        .HasForeignKey(t => t.ProjectId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTask>()
        .HasOne(t => t.AssignedToUser)
        .WithMany()
        .HasForeignKey(t => t.AssignedToUserId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTask>()
        .HasOne(t => t.CreatedByUser)
        .WithMany()
        .HasForeignKey(t => t.CreatedByUserId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Comment>()
        .HasOne(c => c.Task)
        .WithMany()
        .HasForeignKey(c => c.TaskId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Comment>()
        .HasOne(c => c.User)
        .WithMany()
        .HasForeignKey(c => c.UserId)
        .OnDelete(DeleteBehavior.Restrict);

    }
    }
}