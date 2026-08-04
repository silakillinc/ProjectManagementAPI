
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

            if (projectTask.AssignedToUserId.HasValue)
            {
                projectTask.AssignedToUser = await _context.Users
                    .AsNoTracking()
                    .FirstAsync(user => user.Id == projectTask.AssignedToUserId.Value);
            }

            return projectTask.ToResponseDto();
        }

        public async Task<TaskResponseDto> AssignTask(int id, AssignTaskDto dto, int userId,bool isAdmin)
        {
            var task = await _context.Tasks
                .Include(task => task.AssignedToUser)
                .FirstOrDefaultAsync(task=>task.Id== id && !task.IsDeleted);

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

        var isMember = await _context.ProjectMembers.AnyAsync(member =>member.ProjectId == task.ProjectId && member.UserId == dto.AssignedToUserId && member.IsActive);

        if (!isMember)
        {
            throw new BadRequestException("Görev yalnızca projenin aktif bir üyesine atanabilir.");
        }

        if (task.AssignedToUserId == dto.AssignedToUserId)
        {
            throw new ConflictException("Görev zaten bu kullanıcıya atanmış");
        }

        var oldAssignedUserId = task.AssignedToUserId;

        task.AssignedToUserId = dto.AssignedToUserId;
        task.AssignedToUser = await _context.Users
            .FirstAsync(user => user.Id == dto.AssignedToUserId);
        task.UpdatedAt = DateTime.UtcNow;

        var history = new TaskHistory
        {
            TaskId = task.Id,
            ChangedByUserId = userId,
            ChangeType = "AssignedUserChanged",
            OldValue = oldAssignedUserId?.ToString(),
            NewValue = dto.AssignedToUserId.ToString(),
            Description = "Görevin atandığı kullanıcı değiştirildi.",
            CreatedAt = DateTime.UtcNow
        };

        _context.TaskHistories.Add(history);

        await _context.SaveChangesAsync();

        return task.ToResponseDto();

        }
        public async Task<TaskResponseDto> UpdateStatus(int id, ProjectTaskStatus status,int userId,bool isAdmin)
        {
            var task = await _context.Tasks
                .Include(task => task.AssignedToUser)
                .FirstOrDefaultAsync(task =>task.Id == id &&!task.IsDeleted);

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

            if (task.Status == status)
            {
                throw new ConflictException("Görev zaten bu durumda");
            }

            var oldStatus=task.Status;

            task.Status= status;
            task.UpdatedAt=DateTime.UtcNow;

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
                ChangeType="StatusChanged",
                OldValue= oldStatus.ToString(),
                NewValue=status.ToString(),
                Description="Görevin durumu değiştirildi",
                CreatedAt=DateTime.UtcNow,
            };

            _context.TaskHistories.Add(history);

            await _context.SaveChangesAsync();

            return task.ToResponseDto();
        }
        public async Task<List<TaskResponseDto>> GetTasks(int userId, bool isAdmin)
    {

        var query = _context.Tasks
            .AsNoTracking()
            .Include(task => task.AssignedToUser)
            .Where(task => !task.IsDeleted);
        if (!isAdmin)
    {
        query = query.Where(task =>_context.Projects.Any(project =>project.Id == task.ProjectId &&!project.IsDeleted &&project.OwnerId == userId)
            ||
            _context.ProjectMembers.Any(member =>member.ProjectId == task.ProjectId &&member.UserId == userId && member.IsActive));
    }
    var tasks = await query.ToListAsync();

    return tasks.Select(task => task.ToResponseDto()).ToList();

    }
    public async Task<List<TaskHistoryResponseDto>>GetTaskHistories(int taskId,int userId,bool isAdmin)
        {
            var task= await _context.Tasks.FirstOrDefaultAsync(task=>task.Id==taskId&& !task.IsDeleted);
            if (task is null)
            {
                throw new NotFoundException ("Görev bulunamadı.");
            }
            var project =await _context.Projects.FirstOrDefaultAsync(project=> project.Id==task.ProjectId && !project.IsDeleted);

            if(project is null)
            {
                throw new NotFoundException("Görevin bağlı olduğu proje bulunamadı");
            }
            var isProjectOwner=project.OwnerId==userId;

            var isActiveMember= await _context.ProjectMembers
                .AnyAsync(member =>
                    member.ProjectId==task.ProjectId &&
                    member.UserId==userId &&
                    member.IsActive);
            if (!isAdmin && !isProjectOwner && !isActiveMember)
            {
                throw new ForbiddenException("Bu görevin geçmişini görüntüleme yetkiniz yok");
            }
            return await _context.TaskHistories
            .AsNoTracking()
            .Where(history=> history.TaskId==taskId)
            .OrderByDescending(history => history.CreatedAt)
            .Select(history=> new TaskHistoryResponseDto
            {
                Id=history.Id,
                TaskId=history.TaskId,
                ChangedByUserId= history.ChangedByUserId,
                ChangedByUserName = history.ChangedByUser.FirstName + " " + history.ChangedByUser.LastName,
                ChangeType = history.ChangeType,
                OldValue = history.OldValue,
                NewValue = history.NewValue,
                Description = history.Description,
                CreatedAt = history.CreatedAt

            })
            .ToListAsync();
        }
        public async Task<TaskResponseDto> GetTaskById(int id,int userId,bool isAdmin)
        {
             var task = await _context.Tasks.AsNoTracking()
            .Include(task => task.AssignedToUser)
            .FirstOrDefaultAsync(task =>task.Id == id &&!task.IsDeleted);
            if(task is null)
            {
                throw new NotFoundException("Görev bulunamadı.");
            }
            var project =await _context.Projects.AsNoTracking()
            .FirstOrDefaultAsync(project=>project.Id==task.ProjectId && !project.IsDeleted);

            if (project is null)
            {
                throw new NotFoundException("Görevin bağlı olduğu proje bulunamadı.");
            }
            var isProjectOwner = project.OwnerId == userId;
            var isActiveMember = await _context.ProjectMembers.AnyAsync(member =>
            member.ProjectId == task.ProjectId &&
            member.UserId == userId &&
            member.IsActive);

             if (!isAdmin && !isProjectOwner && !isActiveMember)
            {
            throw new ForbiddenException("Bu görevi görüntüleme yetkiniz yok.");
            }
            return task.ToResponseDto();
        }
        public async Task<TaskResponseDto> UpdateTask(int id,UpdateTaskDto dto,int userId,bool isAdmin)
    {
            var task = await _context.Tasks
                .Include(task => task.AssignedToUser)
                .FirstOrDefaultAsync(task =>task.Id == id &&!task.IsDeleted);

        if (task is null)
    {
        throw new NotFoundException("Görev bulunamadı.");
    }
        var project = await _context.Projects.FirstOrDefaultAsync(project =>project.Id == task.ProjectId &&!project.IsDeleted);

        if (project is null)
    {
        throw new NotFoundException("Görevin bağlı olduğu proje bulunamadı.");
    }

        if (!isAdmin && project.OwnerId != userId)
    {
        throw new ForbiddenException("Bu görevi güncelleme yetkiniz yok.");
    }

    if (dto.DueDate.HasValue &&dto.DueDate.Value < project.StartDate)
    {
        throw new BadRequestException("Görev teslim tarihi proje başlangıcından önce olamaz.");
    }
    var hasChanges =task.Title != dto.Title ||task.Description != dto.Description ||
        task.Priority != dto.Priority ||
        task.DueDate != dto.DueDate ||
        task.EstimatedHours != dto.EstimatedHours;

        if (!hasChanges)
    {
        throw new ConflictException("Görev bilgilerinde herhangi bir değişiklik yapılmadı.");
    }

    var oldPriority = task.Priority;

    task.Title = dto.Title;
    task.Description = dto.Description;
    task.Priority = dto.Priority;
    task.DueDate = dto.DueDate;
    task.EstimatedHours = dto.EstimatedHours;
    task.UpdatedAt = DateTime.UtcNow;

    if (oldPriority != dto.Priority)
    {
        var history = new TaskHistory
        {
            TaskId = task.Id,
            ChangedByUserId = userId,
            ChangeType = "PriorityChanged",
            OldValue = oldPriority.ToString(),
            NewValue = dto.Priority.ToString(),
            Description = "Görevin önceliği değiştirildi.",
            CreatedAt = DateTime.UtcNow
        };
        _context.TaskHistories.Add(history);
    }

    await _context.SaveChangesAsync();

    return task.ToResponseDto();
}
public async Task DeleteTask(int id, int userId, bool isAdmin)
        {
          var task = await _context.Tasks.FirstOrDefaultAsync(task =>task.Id == id &&!task.IsDeleted);
          if (task is null)
            {
                throw new NotFoundException("Görev bulunamadı.");
            }
            var project = await _context.Projects.FirstOrDefaultAsync(project =>project.Id == task.ProjectId &&!project.IsDeleted);
            if(project is null)
            {
                throw new NotFoundException("Görevin bağlı olduğu proje bulunamadı.");
            }
            if(!isAdmin &&project.OwnerId != userId)
            {
                throw new ForbiddenException("Bu görevi silme yetkiniz yok");
            }
            task.IsDeleted=true;
            task.UpdatedAt=DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

    }
    }
