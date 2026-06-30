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
    }
}