namespace ProjectManagement.API.Models
{
    public class TaskHistory
    {
        public int Id{get;set;}
        public int  TaskId{get;set;}
        public ProjectTask Task{get;set;}=null!;
        public int ChangedByUserId{get;set;}
        public User ChangedByUser{get;set;}=null!;
        public string ChangeType{get;set;}=string.Empty;
        public string? OldValue{get;set;}
            public string? NewValue { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
}