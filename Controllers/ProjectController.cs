using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using ProjectManagement.API.Services;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ProjectService _projectService;

        public ProjectsController(AppDbContext context, ProjectService projectService)
        {
            _context = context;
            _projectService=projectService;
        }

        [HttpPost]
        [Authorize (Roles="Admin,ProjectManager")]
        public async Task<IActionResult> CreateProject(CreateProjectDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var project = await _projectService.CreateProject(dto,userId);
            return Ok(project);
        }

        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await _context.Projects
                .Where(p => !p.IsDeleted)
                .ToListAsync();

            return Ok(projects);
        }
    }
}