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
  [Route("api/projects/{projectId}/members")]  
  [Authorize]
  public class ProjectMemberController : ControllerBase
    {
      private readonly AppDbContext _context;
      private readonly ProjectMemberService _projectMemberService;  

      public ProjectMemberController(AppDbContext context, ProjectMemberService projectMemberService)
        {
          _context= context;
          _projectMemberService=projectMemberService;  
        }
    [HttpPost]
    [Authorize(Roles = "Admin,ProjectManager")]
    public async Task<IActionResult> AddProjectMember(AddProjectMemberDto dto,int projectId)
        {
          var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
          var newMember=await _projectMemberService.AddProjectMember(dto, userId,projectId);  
          return Ok (newMember);
        }
    }
}

