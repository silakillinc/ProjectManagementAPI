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
  [Route("api/projects/{projectId}/members")]  
  [Authorize]
  public class ProjectMemberController : ControllerBase
    {
      private readonly ProjectMemberService _projectMemberService; 
      private readonly IValidator<AddProjectMemberDto> _memberValidator; 

      public ProjectMemberController(ProjectMemberService projectMemberService,IValidator<AddProjectMemberDto> memberValidator)
        {
          _projectMemberService=projectMemberService;  
          _memberValidator = memberValidator;
        }
    [HttpPost]
    [Authorize(Roles = "Admin,ProjectManager")]
    public async Task<IActionResult> AddProjectMember(AddProjectMemberDto dto,int projectId)
        {
          await _memberValidator.ValidateAndThrowAsync(dto);

          var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
          var newMember=await _projectMemberService.AddProjectMember(dto, userId,projectId);  
          
          return Ok (newMember);
        }
    }
}

