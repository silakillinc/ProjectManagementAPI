using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Mappings;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using ProjectManagement.API.Exceptions;

namespace ProjectManagement.API.Services
{
    public class ProjectService
    {
        private readonly AppDbContext _context;
        public ProjectService(AppDbContext context){
            _context= context;
        }
        public async Task<ProjectResponseDto> CreateProject(CreateProjectDto dto, int userId)
        {
            if (dto.EndDate < dto.StartDate)
            {
                throw new BadRequestException("Proje bitiş tarihi başlangıç tarihinden önce olamaz.");
            }
             var project = new Project
    {
        Name = dto.Name,
        Description = dto.Description,
        StartDate = dto.StartDate,
        EndDate = dto.EndDate,
        Status = ProjectStatus.Planning,
        OwnerId = userId,
        CreatedAt = DateTime.UtcNow
    };

    _context.Projects.Add(project);
    await _context.SaveChangesAsync();

    return project.ToResponseDto();
}
   public async Task<List<ProjectResponseDto>> GetProjects(int userId, bool isAdmin)
{
    var query = _context.Projects
        .AsNoTracking()
        .Where(project => !project.IsDeleted);

    if (!isAdmin)
    {
        query = query.Where(project =>
            project.OwnerId == userId ||
            _context.ProjectMembers.Any(member =>
                member.ProjectId == project.Id &&
                member.UserId == userId &&
                member.IsActive));
    }

    var projects = await query.ToListAsync();

    return projects
        .Select(project => project.ToResponseDto())
        .ToList();
} 
    public async Task<ProjectResponseDto>GetProjectById(int id, int userId, bool isAdmin)
        {
            var project= await _context.Projects.AsNoTracking().FirstOrDefaultAsync(project=>project.Id==id && !project.IsDeleted);

            if (project == null)
            {
                throw new NotFoundException("Proje Bulunamadı");
            }

            var isActiveMember=await _context.ProjectMembers.AnyAsync(member=> member.ProjectId== id && member.UserId==userId&& member.IsActive);

            var isProjectOwner=project.OwnerId==userId;

            if(!isAdmin && !isProjectOwner && !isActiveMember)
            {
                throw new ForbiddenException("Bu prrojeyi görünteleme yetkiniz yok");
            }
            return project.ToResponseDto();
        }
    public async Task<ProjectResponseDto>UpdateProject(int id,UpdateProjectDto dto, int userId, bool isAdmin)
        {
            var project =await _context.Projects.FirstOrDefaultAsync(project=>project.Id==id&& !project.IsDeleted);
            if (project == null)
            {
                throw new NotFoundException("Proje Bulunamadı");
            }
            if(!isAdmin && project.OwnerId != userId)
            {
                throw new ForbiddenException("Bu projeyi güncelleme yetkiniz yok");
            }
            if (dto.EndDate < dto.StartDate)
            {
                throw new BadRequestException("bitiş tarihi başlangıç tarihinden önce olamaz");
            }
            project.Name=dto.Name;
            project.Description=dto.Description;
            project.StartDate=dto.StartDate;
            project.EndDate=dto.EndDate;
            project.Status=dto.Status;
            project.UpdatedAt=DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return project.ToResponseDto();
        }
    public async Task<ProjectResponseDto>ArchiveProject(int id, int userId, bool isAdmin)
        {
            var project= await _context.Projects.FirstOrDefaultAsync(project=> project.Id== id && !project.IsDeleted);
            if(project== null)
            {
                throw new NotFoundException("Proje Bulunamadı");
            }
            if (!isAdmin && project.OwnerId != userId)
            {
                throw new ForbiddenException("Bu projeyi arşivleme yetkiniz yok.");
            }
            if (project.IsArchived)
            {
                throw new ConflictException("Proje zaten arşivlenmiş");
            }
            project.IsArchived=true;
            project.ArchivedAt=DateTime.UtcNow;
            project.UpdatedAt=DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return project.ToResponseDto();
        }   
    public async Task DeleteProject(int id, int userId, bool isAdmin)
        {
            var project =await _context.Projects.FirstOrDefaultAsync(project=>project.Id== id && !project.IsDeleted);
            if (project == null)
            {
                throw new NotFoundException("Proje Bulunamadı");
            }
            if(!isAdmin && project.OwnerId != userId)
            {
                throw new ForbiddenException("Bu projeyi silme  yetkiniz yok ");
            }
            project.IsDeleted=true;
            project.UpdatedAt=DateTime.UtcNow;

            var tasks=await _context.Tasks.Where(task=> task.ProjectId== id && !task.IsDeleted).ToListAsync();

            foreach (var task in tasks)
            {
                task.IsDeleted=true;
                task.UpdatedAt=DateTime.UtcNow;
            }
            var members=await _context.ProjectMembers.Where(member=>member.ProjectId== id && member.IsActive).ToListAsync();

            foreach (var member in members)
            {
                member.IsActive=false;
            }
            await _context.SaveChangesAsync();
        }
        
}
}
