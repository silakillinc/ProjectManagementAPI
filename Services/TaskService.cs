
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.Exceptions;
using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Mappings;

namespace ProjectManagement.API.Services{
    public class TaskService
    {
        private readonly AppDbContext _context;
        public TaskService(AppDbContext context)
        {
            _context= context;
        }
        public async Task<TaskResponseDto> CreateTask(CreateTaskDto dto, int userId)
        {
            if (dto.EstimatedHours < 0)
            {
                throw new BadRequestException("Tahmini sure negatif olamaz.");
            }
            var project=await _context.Projects.FindAsync(dto.ProjectId);
            if(project==null) throw new NotFoundException("Proje bulunamadi");
            if (dto.DueDate < project.StartDate)
            {
                throw new BadRequestException("Teslim tarihi proje baslangicindan once olamaz.");
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
            return projectTask.ToResponseDto();
        }

        public async Task<TaskResponseDto> AssignTask(int id, AssignTaskDto dto, int userId)
        {
            var task = await _context.Tasks.FindAsync(id);
            if(task == null) throw new NotFoundException("Gorev bulunamadi.");

            var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == dto.AssignedToUserId);

            if (!isMember) throw new BadRequestException("Kullanici projenin uyesi degil.");

            task.AssignedToUserId = dto.AssignedToUserId;
            await _context.SaveChangesAsync();
            return task.ToResponseDto();
        }
        public async Task<TaskResponseDto> UpdateStatus(int id, ProjectTaskStatus status,int userId)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) throw new NotFoundException("Gorev bulunamadi.");
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
            return task.ToResponseDto();
        }
        public async Task<List<TaskResponseDto>> GetTasks()
    {
        var tasks = await _context.Tasks
        .AsNoTracking()
        .Where(task => !task.IsDeleted)
        .ToListAsync();

        return tasks
        .Select(task => task.ToResponseDto())
        .ToList();
    }
      }    
    }
