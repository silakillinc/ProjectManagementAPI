
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Mappings;
namespace ProjectManagement.API.Services
{
   public class ProjectMemberService
    {
      private readonly AppDbContext _context; 
      public ProjectMemberService(AppDbContext context){
        _context=context;
      }
      public async Task<ProjectMemberResponseDto>AddProjectMember(AddProjectMemberDto dto,int userId,int projectId)
        {
          var member=new ProjectMember{
          UserId= dto.UserId,
          ProjectId=projectId,
          Role=ProjectMemberRole.Member,
          JoinedAt=DateTime.UtcNow,
          IsActive=true
         
        }; 
            _context.ProjectMembers.Add(member);
            await _context.SaveChangesAsync();
            return member.ToResponseDto(); 
        }
    } 
}