
using Microsoft.AspNetCore.Mvc;
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
            if (dto.EstimatedHours < 0)
            {
                throw new Exception("Tahmini sure negatif olamaz.");
            }
            var project=await _context.Projects.FindAsync(dto.ProjectId);
            if(project==null) throw new Exception("Proje bulunamadi");
            if (dto.DueDate < project.StartDate)
            {
                throw new Exception("Bitis tarihi proje baslangicindan once olamaz.");
            }
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

        public async Task<ProjectTask> AssignTask(int id, AssignTaskDto dto, int userId)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) throw new Exception("No Task Found.");

            task.AssignedToUserId = dto.AssignedToUserId;
            await _context.SaveChangesAsync();
            return task;
        }
        public async Task<ProjectTask> UpdateStatus(int id, ProjectTaskStatus status,int userId)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) throw new Exception("No Task Found.");
            var oldStatus=task.Status;
            task.Status= status;
            if (status== ProjectTaskStatus.Done)
            {
                task.CompletedAt=DateTime.UtcNow;
            }
            else
            {
                task.CompletedAt=null;
            }
            var history=new TaskHistory
            {
                TaskId= id,
                ChangedByUserId=userId,
                ChangeType="Status changed",
                OldValue= oldStatus.ToString(),
                NewValue=status.ToString(),
                CreatedAt=DateTime.UtcNow,
            };
            _context.TaskHistories.Add(history);
            await _context.SaveChangesAsync();
            return task;
        }
      }    
    }
