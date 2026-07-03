
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;

namespace ProjectManagement.API.Services{
    public class TaskService
    {
        private readonly AppDbContext _context;
        public TaskService(AppDbContext context)
        {
            _context= context;
        }
        public async Task<ProjectTask> CreateTask(CreateTaskDto dto, int userId)
        {
            var projectTask= new ProjectTask
            {
                Title= dto.Title,
                Description= dto.Description,
                ProjectId= dto.ProjectId,
                AssignedToUserId=dto.AssignedToUserId,
                Priority=dto.Priority,
                DueDate= dto.DueDate,
                EstimatedHours=dto.EstimatedHours,
                CreatedByUserId=userId,
                CreatedAt=DateTime.UtcNow,
                Status= ProjectTaskStatus.ToDo
            };
            _context.Tasks.Add(projectTask);
            await _context.SaveChangesAsync();
            return projectTask;

        }
    }
}