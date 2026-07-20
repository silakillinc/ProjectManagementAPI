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
            Role = member.Role.ToString(),
            JoinedAt = member.JoinedAt,
            IsActive = member.IsActive
        };
    }
}