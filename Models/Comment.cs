namespace ProjectManagement.API.Models
{
    public class Comment
    {
        public int Id{get;set;}
        public string Content{get;set;}= string.Empty;
        public int TaskId{get;set;}
        public ProjectTask Task {get;set;}=null!;
        public int UserId{get;set;}
        public User User{get;set;}=null!;
        public DateTime CreatedAt{get;set;}
        public DateTime?UpdatedAt{get;set;}
        public bool IsDeleted{get;set;}=false;
    }

}