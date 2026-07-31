namespace ProjectManagement.API.DTOs;

public class CreateTaskTimeLogDto{
    public decimal Hours {get;set;}
    public string? Description {get;set;}
    public DateTime WorkDate {get;set;}
}
