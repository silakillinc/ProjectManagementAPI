using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Models;

namespace ProjectManagement.API.Mappings;

public static class DtoMappingExtensions
{
    public static ProjectResponseDto ToResponseDto(
        this Project project)
    {
        return new ProjectResponseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            Status = project.Status.ToString(),
            OwnerId = project.OwnerId,
            IsArchived = project.IsArchived,
            CreatedAt = project.CreatedAt
        };
    }

    public static TaskResponseDto ToResponseDto(
        this ProjectTask task)
    {
        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            ProjectId = task.ProjectId,
            AssignedToUserId = task.AssignedToUserId,
            AssignedToUserName = task.AssignedToUser is null
                ? null
                : task.AssignedToUser.FirstName + " " + task.AssignedToUser.LastName,
            AssignedToUserEmail = task.AssignedToUser?.Email,
            CreatedByUserId = task.CreatedByUserId,
            Status = task.Status.ToString(),
            Priority = task.Priority.ToString(),
            DueDate = task.DueDate,
            EstimatedHours = task.EstimatedHours,
            CreatedAt = task.CreatedAt,
            CompletedAt = task.CompletedAt
        };
    }

    public static CommentResponseDto ToResponseDto(
        this Comment comment)
    {
        return new CommentResponseDto
        {
            Id = comment.Id,
            Content = comment.Content,
            TaskId = comment.TaskId,
            UserId = comment.UserId,
            UserName = comment.User.FirstName + " " + comment.User.LastName,
            Email = comment.User.Email,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }

    public static ProjectMemberResponseDto ToResponseDto(
        this ProjectMember member)
    {
        return new ProjectMemberResponseDto
        {
            Id = member.Id,
            ProjectId = member.ProjectId,
            UserId = member.UserId,
            UserName = member.User.FirstName + " " + member.User.LastName,
            Email = member.User.Email,
            Role = member.Role.ToString(),
            JoinedAt = member.JoinedAt,
            IsActive = member.IsActive
        };
    }
    public static TaskTimeLogResponseDto ToResponseDto(this TaskTimeLog timeLog)
    {
        return new TaskTimeLogResponseDto
        {
            Id=timeLog.Id,
            TaskId = timeLog.TaskId,
            UserId = timeLog.UserId,
            UserName = timeLog.User.FirstName + " " + timeLog.User.LastName,
            UserEmail = timeLog.User.Email,
            Hours = timeLog.Hours,
            Description = timeLog.Description,
            WorkDate = timeLog.WorkDate,
            CreatedAt = timeLog.CreatedAt
        };
    }
}
