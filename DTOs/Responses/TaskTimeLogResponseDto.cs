namespace ProjectManagement.API.DTOs.Responses;

public class TaskTimeLogResponseDto
{
    public int Id {get;set;}
    public int TaskId {get;set;}
    public int UserId {get; set;}
    public decimal Hours {get;set;}
    public string? Description {get;set;}
    public DateTime WorkDate{get;set;}
    public DateTime CreatedAt {get;set;}
}