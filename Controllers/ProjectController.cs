using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using ProjectManagement.API.Services;
using FluentValidation;
using Microsoft.VisualBasic;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        
        private readonly ProjectService _projectService;
        private readonly IValidator<CreateProjectDto> _createProjectValidator;
        private readonly IValidator<UpdateProjectDto> _updateProjectValidator;

        public ProjectsController(ProjectService projectService,IValidator<CreateProjectDto> createProjectValidator,IValidator<UpdateProjectDto> updateProjectValidator)
        {
            
            _projectService=projectService;
            _createProjectValidator = createProjectValidator;
            _updateProjectValidator=updateProjectValidator;
        }

        /// <summary>
        /// Yeni bir proje oluştur
        /// </summary>
        
        [HttpPost]
        [Authorize (Roles="Admin,ProjectManager")]
        public async Task<IActionResult> CreateProject(CreateProjectDto dto)
        {
            await _createProjectValidator.ValidateAndThrowAsync(dto);

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var project = await _projectService.CreateProject(dto,userId);

            return Ok(project);
        }

        /// <summary>
        /// Kullanıcının Erişebildiği Projeler
        /// </summary>

        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");
            var projects = await _projectService.GetProjects(userId, isAdmin);
            return Ok(projects);
        }

        ///<summary>
        ///Proje Detaylarını Görüntüle
        ///</summary>
        ///
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProjectsById(int id)
        {
            var userId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var isAdmin=User.IsInRole("Admin");

            var project= await _projectService.GetProjectById(id,userId,isAdmin);

            return Ok(project);
        }

        ///<summary>
        /// Proje Bilgilerini Güncelle
        ///</summary>

        [HttpPut("{id}")]
        [Authorize (Roles ="Admin,ProjectManager")]
        public async Task<IActionResult>UpdateProject(int id, UpdateProjectDto dto)
        {
            await _updateProjectValidator.ValidateAndThrowAsync(dto);

            var userId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var isAdmin=User.IsInRole("Admin");
            var project= await _projectService.UpdateProject(id,dto,userId,isAdmin);

            return Ok(project);
        }

        ///<summary>
        ///Projeyi Arşivle
        ///</summary>
        [HttpPatch("{id}/archive")]
        [Authorize(Roles = "Admin,ProjectManager")]

        public  async Task<IActionResult> ArchiveProject(int id)
        {
            var userId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var isAdmin=User.IsInRole("Admin");

            var project= await _projectService.ArchiveProject(id,userId,isAdmin);

            return Ok(project);
        }

        /// <summary>
        /// Projeyi güvenli şekilde sil.
        /// </summary>
        
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,ProjectManager")]
        public async Task<IActionResult>DeleteProjecy(int id)
        {
            var userId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var isAdmin=User.IsInRole("Admin");

            await _projectService.DeleteProject(id,userId,isAdmin);

            return NoContent();
        }
    }
}
