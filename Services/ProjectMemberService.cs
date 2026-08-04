
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Mappings;
using ProjectManagement.API.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography.X509Certificates;
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
          var project = await _context.Projects.FirstOrDefaultAsync(project => project.Id == projectId && !project.IsDeleted);

          if (project is null)
          {
            throw new NotFoundException("Proje bulunamadı.");
          }

          if (!isAdmin && project.OwnerId != userId)
          {
            throw new ForbiddenException("Bu projeye üye ekleme yetkiniz yok.");
          }

          var userToAdd = await _context.Users.FirstOrDefaultAsync(user =>
            user.Id == dto.UserId &&
            user.IsActive &&
            !user.IsDeleted);

          if (userToAdd is null)
          {
            throw new NotFoundException("Eklenecek aktif kullanıcı bulunamadı.");
          }

          var existingMember = await _context.ProjectMembers.FirstOrDefaultAsync(member =>member.ProjectId == projectId && member.UserId == dto.UserId);

          if (existingMember is not null)
          {
            if (existingMember.IsActive)
            {
              throw new ConflictException("Kullanıcı zaten bu projenin üyesi.");
            }

            existingMember.IsActive = true;
            existingMember.Role=dto.Role;
            existingMember.JoinedAt = DateTime.UtcNow;
            existingMember.User = userToAdd;

            await _context.SaveChangesAsync();
            return existingMember.ToResponseDto();
          }

          var member=new ProjectMember{
          UserId= dto.UserId,
          ProjectId=projectId,
          Role=dto.Role,
          JoinedAt=DateTime.UtcNow,
          IsActive=true,
          User=userToAdd
         
        }; 
          _context.ProjectMembers.Add(member);
          await _context.SaveChangesAsync();
          return member.ToResponseDto(); 
        }
        public async Task<List<ProjectMemberResponseDto>>GetProjectMembers(int projectId, int userId, bool isAdmin)
        {
            var project= await _context.Projects.FirstOrDefaultAsync(project=>project.Id== projectId&& !project.IsDeleted);
            if(project is null)
            {
                throw new NotFoundException("Proje bulunamadı.");
            }
            var isProjectOwner=project.OwnerId==userId;

            var isActiveMember= await _context.ProjectMembers.AnyAsync(member=> member.ProjectId== projectId && member.UserId== userId && member. IsActive);

            if(!isAdmin && ! isProjectOwner && !isActiveMember)
            {
                throw new ForbiddenException("Bu projenin üyelerini görüntüleme yetkiniz yok");
            }
            var members= await _context.ProjectMembers
            .Include(member => member.User)
            .Where(member => member.ProjectId==projectId&& member.IsActive)
            .OrderBy(member=>member.Id).ToListAsync();
            return members.Select(member=>member.ToResponseDto()).ToList();
        }
        public async Task<List<UserResponseDto>> GetAvailableUsers(int projectId, int userId, bool isAdmin)
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

            return await _context.Users
                .Where(user =>
                    user.IsActive &&
                    !user.IsDeleted &&
                    !_context.ProjectMembers.Any(member =>
                        member.ProjectId == projectId &&
                        member.UserId == user.Id &&
                        member.IsActive))
                .OrderBy(user => user.FirstName)
                .ThenBy(user => user.LastName)
                .Select(user => new UserResponseDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    Department = user.Department,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                })
                .ToListAsync();
        }
        public async Task<ProjectMemberResponseDto>UpdateProjectMemberRole(int projectId, int memberId, UpdateProjectMemberRoleDto dto,
        int userId, bool isAdmin)
        {
            var project=await _context.Projects.FirstOrDefaultAsync(project=> project.Id== projectId && !project.IsDeleted);
            if (project is null)
            {
                throw new NotFoundException("Proje Bulunamadı");
            }
            if(!isAdmin && project.OwnerId != userId)
            {
                throw new ForbiddenException("Proje üyesinin rolünü değiştirme yetkiniz yok.");
            }
            var member =await _context.ProjectMembers
            .Include(member => member.User)
            .FirstOrDefaultAsync(member=> member.Id==memberId && member.ProjectId== projectId&&member.IsActive);
            if (member is null)
            {
                throw new NotFoundException ("Aktif proje üyeliği bulunamadı");
            }
            if(member.Role== dto.Role)
            {
                throw new ConflictException("Proje üyesi zaten bu role sahip");
            }
            member.Role=dto.Role;

            await _context.SaveChangesAsync(); 
            return member.ToResponseDto();
        }
        public async Task RemoveProjectMember(int projectId, int memberId, int userId,bool isAdmin)
        {
            var project= await _context.Projects.FirstOrDefaultAsync(project =>project.Id==projectId&& !project.IsDeleted);
            if (project is null)
            {
                throw new NotFoundException("Proje bulunamadı");
            }
            if(!isAdmin && project.OwnerId != userId)
            {
                throw new ForbiddenException("Bu projeden üye çıkarma yetkiniz yok");
            }
            var member =await _context.ProjectMembers.FirstOrDefaultAsync(member =>member.Id== memberId && member.ProjectId== projectId && member.IsActive);
            if(member is null)
            {
                throw new NotFoundException("Aktif proje üyesi bulunamadı.");
            }
            member.IsActive=false;

            await _context.SaveChangesAsync();
        }
    } 
}
