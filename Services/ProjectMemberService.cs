
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Mappings;
using ProjectManagement.API.Exceptions;
using Microsoft.EntityFrameworkCore;
namespace ProjectManagement.API.Services
{
   public class ProjectMemberService
    {
      private readonly AppDbContext _context; 
      public ProjectMemberService(AppDbContext context){
        _context=context;
      }
      public async Task<ProjectMemberResponseDto>AddProjectMember(
        AddProjectMemberDto dto,
        int userId,
        int projectId,
        bool isAdmin)
        {
          var project = await _context.Projects
            .FirstOrDefaultAsync(project => project.Id == projectId && !project.IsDeleted);

          if (project is null)
          {
            throw new NotFoundException("Proje bulunamadı.");
          }

          if (!isAdmin && project.OwnerId != userId)
          {
            throw new ForbiddenException("Bu projeye üye ekleme yetkiniz yok.");
          }

          var userExists = await _context.Users.AnyAsync(user =>
            user.Id == dto.UserId && user.IsActive && !user.IsDeleted);

          if (!userExists)
          {
            throw new NotFoundException("Eklenecek aktif kullanıcı bulunamadı.");
          }

          var existingMember = await _context.ProjectMembers
            .FirstOrDefaultAsync(member =>
              member.ProjectId == projectId && member.UserId == dto.UserId);

          if (existingMember is not null)
          {
            if (existingMember.IsActive)
            {
              throw new ConflictException("Kullanıcı zaten bu projenin üyesi.");
            }

            existingMember.IsActive = true;
            existingMember.JoinedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existingMember.ToResponseDto();
          }

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
