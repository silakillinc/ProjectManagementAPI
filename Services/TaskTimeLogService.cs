using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Exceptions;
using ProjectManagement.API.Mappings;
using ProjectManagement.API.Models;

namespace ProjectManagement.API.Services;

public class TaskTimeLogService
{
    private readonly AppDbContext _context;
    public TaskTimeLogService(AppDbContext context)
    {
        _context= context;
    }
    public async Task <TaskTimeLogResponseDto>CreateTimeLog(int taskId, int userId, CreateTaskTimeLogDto dto,bool isAdmin)
    {
        var task =await _context.Tasks.FirstOrDefaultAsync(task=> task.Id==taskId&& !task.IsDeleted);
        if (task is null)
        {
            throw new NotFoundException("Görev Bulunamadı");
        }
        var project=await _context.Projects.FirstOrDefaultAsync(project=> project.Id==task.ProjectId&& !project.IsDeleted);   
        if (project is null)
        {
            throw new NotFoundException("Görevin projesi bulunamadı");
        }  
        var isProjectOwner = project.OwnerId == userId;

        var isAssignedUser = task.AssignedToUserId == userId;

        var isActiveMember = await _context.ProjectMembers
            .AnyAsync(member =>
                member.ProjectId == task.ProjectId &&
                member.UserId == userId &&
                member.IsActive &&
                member.Role != ProjectMemberRole.Viewer);
        var canAddTimeLog = isAdmin ||isProjectOwner ||(isAssignedUser && isActiveMember);
        if (!canAddTimeLog)
        {
            throw new ForbiddenException("Bu göreve zaman kaydı ekleme yetkiniz yok.");
        }
        var timeLog = new TaskTimeLog
        {
            TaskId = taskId,
            UserId = userId,
            Hours = dto.Hours,
            Description = dto.Description,
            WorkDate = dto.WorkDate,
            CreatedAt = DateTime.UtcNow
        };
        timeLog.User = await _context.Users
            .FirstAsync(user => user.Id == userId);
        _context.TaskTimeLogs.Add(timeLog);

        await _context.SaveChangesAsync();

        return timeLog.ToResponseDto();
    }
    public async Task<TaskTimeLogListResponseDto> GetTimeLogs(int taskId,int currentUserId,bool isAdmin,int? timeLogUserId,DateTime? workDate)
    {
        var task=await _context.Tasks.AsNoTracking()
        .FirstOrDefaultAsync(task=> task.Id== taskId&& !task.IsDeleted);

        if(task is null)
        {
            throw new NotFoundException("Görev Bulunamadı.");
        }
        var project=await _context.Projects.AsNoTracking().FirstOrDefaultAsync(project=>project.Id==task.ProjectId && !project.IsDeleted);
        if(project is null)
        {
            throw new NotFoundException("Görevin projesi bulunamadı.");
        }
        var isProjectOwner =project.OwnerId==currentUserId;

        var isActiveMember =await _context.ProjectMembers.AnyAsync(member=> member.ProjectId==task.ProjectId && member.UserId== currentUserId && member.IsActive);
        if(!isAdmin && !isProjectOwner && !isActiveMember)
        {
            throw new ForbiddenException("Bu görevin zaman kayıtlarını görüntüleme yetkiniz yok.");
        }
    var query = _context.TaskTimeLogs
    .AsNoTracking()
    .Include(timeLog => timeLog.User)
    .Where(timeLog => timeLog.TaskId == taskId);

    if (timeLogUserId.HasValue)
    {
    query = query.Where(timeLog =>timeLog.UserId == timeLogUserId.Value);
    }

    if (workDate.HasValue)
    {
    var startDate = workDate.Value.Date;
    var endDate = startDate.AddDays(1);

    query = query.Where(timeLog =>timeLog.WorkDate >= startDate &&timeLog.WorkDate < endDate);
    }

    var timeLogs = await query
    .OrderBy(timeLog => timeLog.WorkDate)
    .ThenBy(timeLog => timeLog.CreatedAt)
    .ToListAsync();

        var responseTimeLogs=timeLogs.Select(timeLog =>timeLog.ToResponseDto()).ToList();

        return new TaskTimeLogListResponseDto
        {
            TaskId=taskId,
            TotalHours=timeLogs.Sum(timeLog=> timeLog.Hours),
            TimeLogs=responseTimeLogs
        };
    }
}
