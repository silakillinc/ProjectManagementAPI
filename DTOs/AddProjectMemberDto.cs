using ProjectManagement.API.Models;

namespace ProjectManagement.API.DTOs
{
  public class AddProjectMemberDto
    {
        public int UserId{get;set;}
        public ProjectMemberRole Role {get;set;}
    }  
}