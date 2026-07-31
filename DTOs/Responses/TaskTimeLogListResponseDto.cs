namespace ProjectManagement.API.DTOs.Responses;

public class TaskTimeLogListResponseDto
{
    public int TaskId { get; set; }
    public decimal TotalHours { get; set; }
    public List<TaskTimeLogResponseDto> TimeLogs { get; set; } = new();
}