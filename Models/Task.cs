
namespace ProjectManagement.API.Models{
public class ProjectTask
{
    public int Id{get;set;}
    public string Title{get;set;}=string.Empty;
    public string? Description{get;set;}
    public int ProjectId{get;set;}
    public Project Project{get;set;}=null!;
    public int? AssignedToUserId {get;set;}
    public User? AssignedToUser {get;set;}
    public int CreatedByUserId{get;set;}
    public User CreatedByUser{get;set;}=null!;
    public TaskStatus Status{get;set;}
    public TaskPriority Priority {get;set;}
    public DateTime? DueDate{get;set;}
    public decimal? EstimatedHours{get;set;}
    public DateTime CreatedAt{get;set;}
    public DateTime? UpdatedAt{get;set;}
    public DateTime? CompletedAt{get;set;}
    public bool IsDeleted{get;set;}=false;
}
public enum ProjectTaskStatus
{
    ToDo,
    InProgress,
    InReview,
    Done
}
public enum TaskPriority
{
    Low,
    Medium,
    High,
    Critical
}
}