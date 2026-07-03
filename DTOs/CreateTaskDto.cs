using ProjectManagement.API.Models;
namespace ProjectManagement.API.DTOs{
    public class CreateTaskDto
    {
        public string Title{get;set;}=string.Empty;
        public string? Description{get;set;}=string.Empty;
        public int ProjectId{get;set;}
        public int? AssignedToUserId {get;set;}
        public TaskPriority Priority{get;set;}
        public DateTime? DueDate {get;set;} 
        public decimal EstimatedHours {get; set;}

    }
}