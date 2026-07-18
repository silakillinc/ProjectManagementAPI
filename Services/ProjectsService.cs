using ProjectManagement.API.Controllers;
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
        public async Task<Project> CreateProject(CreateProjectDto dto, int userId)
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

    return project;
}

}
}