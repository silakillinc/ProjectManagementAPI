using ProjectManagement.API.Models;
    namespace ProjectManagement.API.DTOs
{
    public class CreateCommentsDto
    {
        public int TaskId{get;set;}
        public string Content{get;set;}=string.Empty;
    }
}
