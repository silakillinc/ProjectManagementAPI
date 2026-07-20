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
}
}
