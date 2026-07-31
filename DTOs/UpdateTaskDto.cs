using ProjectManagement.API.Models;

namespace ProjectManagement.API.DTOs;

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal EstimatedHours { get; set; }
}