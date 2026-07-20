
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.Exceptions;
using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Mappings;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ProjectManagement.API.Services{
    public class TaskService
    {
        private readonly AppDbContext _context;
        public TaskService(AppDbContext context)
        {
            _context= context;
        }
        public async Task<TaskResponseDto> CreateTask(CreateTaskDto dto, int userId,bool isAdmin)
        {
            if (dto.EstimatedHours < 0)
            {
                throw new BadRequestException("Tahmini sure negatif olamaz.");
            }
            var project=await _context.Projects.FirstOrDefaultAsync(project=>project.Id==dto.ProjectId&&!project.IsDeleted);
            if(project==null) throw new NotFoundException("Proje bulunamadi");
            if(!isAdmin && project.OwnerId != userId)
            {
              throw new ForbiddenException("Bu projede görev oluşturma yetkiniz yok.");  
            }

            if (dto.DueDate < project.StartDate)
            {
                throw new BadRequestException("Teslim tarihi proje baslangicindan once olamaz.");
            }
            if (dto.AssignedToUserId.HasValue)
{
             var isActiveMember = await _context.ProjectMembers.AnyAsync(member =>member.ProjectId == dto.ProjectId &&member.UserId == dto.AssignedToUserId.Value &&member.IsActive);

            if (!isActiveMember)
            {
                throw new BadRequestException("Görev yalnızca projenin aktif bir üyesine atanabilir.");
            }
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

        public async Task<TaskResponseDto> AssignTask(int id, AssignTaskDto dto, int userId,bool isAdmin)
        {
            var task = await _context.Tasks.FindAsync(id);
            if(task == null) throw new NotFoundException("Gorev bulunamadi.");

            var project = await _context.Projects.FirstOrDefaultAsync(project =>project.Id == task.ProjectId &&!project.IsDeleted);

            if (project == null)
        {
            throw new NotFoundException("Görevin projesi bulunamadı.");
        }

        if (!isAdmin && project.OwnerId != userId)
        {
            throw new ForbiddenException("Bu görev için kullanıcı atama yetkiniz yok.");
        }

        var isMember = await _context.ProjectMembers.AnyAsync(member =>member.ProjectId == task.ProjectId &&member.UserId == dto.AssignedToUserId &&member.IsActive);

        if (!isMember)
        {
            throw new BadRequestException("Görev yalnızca projenin aktif bir üyesine atanabilir.");
        }

        task.AssignedToUserId = dto.AssignedToUserId;

        await _context.SaveChangesAsync();

        return task.ToResponseDto();
            
        }
        public async Task<TaskResponseDto> UpdateStatus(int id, ProjectTaskStatus status,int userId,bool isAdmin)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(task =>task.Id == id &&!task.IsDeleted);

            if (task == null) throw new NotFoundException("Gorev bulunamadi.");

            var project = await _context.Projects.FirstOrDefaultAsync(project =>project.Id == task.ProjectId &&!project.IsDeleted);

            if (project == null)
            {
                throw new NotFoundException("Görevin projesi bulunamadı.");
            }

            var activeMember = await _context.ProjectMembers.FirstOrDefaultAsync(member =>member.ProjectId == task.ProjectId &&member.UserId == userId &&member.IsActive);

            var isProjectOwner = project.OwnerId == userId;

            var isAssignedMember =task.AssignedToUserId == userId &&activeMember != null &&activeMember.Role != ProjectMemberRole.Viewer;

            if (!isAdmin && !isProjectOwner && !isAssignedMember)
            {
                throw new ForbiddenException("Bu görevin durumunu değiştirme yetkiniz yok.");
            }


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
        public async Task<List<TaskResponseDto>> GetTasks(int userId, bool isAdmin)
    {

        var query = _context.Tasks.AsNoTracking().Where(task => !task.IsDeleted);
        if (!isAdmin)
    {
        query = query.Where(task =>_context.Projects.Any(project =>project.Id == task.ProjectId &&!project.IsDeleted &&project.OwnerId == userId)
            ||
            _context.ProjectMembers.Any(member =>member.ProjectId == task.ProjectId &&member.UserId == userId && member.IsActive));
    }
    var tasks = await query.ToListAsync();

    return tasks.Select(task => task.ToResponseDto()).ToList();

    }
      }    
    }
