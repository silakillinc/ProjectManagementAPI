using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using ProjectManagement.API.Services;
using FluentValidation;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        
        private readonly ProjectService _projectService;
        private readonly IValidator<CreateProjectDto> _createProjectValidator;

        public ProjectsController(ProjectService projectService,IValidator<CreateProjectDto> createProjectValidator)
        {
            
            _projectService=projectService;
            _createProjectValidator = createProjectValidator;
        }

        [HttpPost]
        [Authorize (Roles="Admin,ProjectManager")]
        public async Task<IActionResult> CreateProject(CreateProjectDto dto)
        {
            await _createProjectValidator.ValidateAndThrowAsync(dto);

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var project = await _projectService.CreateProject(dto,userId);

            return Ok(project);
        }

        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");
            var projects = await _projectService.GetProjects(userId, isAdmin);
            return Ok(projects);
        }
    }
}
