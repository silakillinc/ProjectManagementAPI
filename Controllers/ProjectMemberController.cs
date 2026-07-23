using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using ProjectManagement.API.Services;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace ProjectManagement.API.Controllers
{
  [ApiController]
  [Route("api/projects/{projectId}/members")]  
  [Authorize]
  public class ProjectMemberController : ControllerBase
    {
      private readonly ProjectMemberService _projectMemberService; 
      private readonly IValidator<AddProjectMemberDto> _memberValidator; 
      private readonly IValidator<UpdateProjectMemberRoleDto> _roleValidator;

      public ProjectMemberController(ProjectMemberService projectMemberService,IValidator<AddProjectMemberDto> memberValidator, IValidator<UpdateProjectMemberRoleDto> roleValidator)
        {
          _projectMemberService=projectMemberService;  
          _memberValidator = memberValidator;
          _roleValidator = roleValidator;
        }

     /// <summary>
     /// Projeye yeni bir ekip üyesi ekle
     /// </summary>
             
    [HttpPost]
    [Authorize(Roles = "Admin,ProjectManager")]
    public async Task<IActionResult> AddProjectMember(AddProjectMemberDto dto,int projectId)
        {
          await _memberValidator.ValidateAndThrowAsync(dto);

          var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
          var isAdmin = User.IsInRole("Admin");
          var newMember=await _projectMemberService.AddProjectMember(dto, userId, projectId, isAdmin);
          
          return Ok (newMember);
        }

      ///<summary>
      ///Projedeki aktif üyeleri listele.
      ///</summary>
      [HttpGet]
      public async Task<IActionResult>GetProjectMembers(int projectId)
        {
            var userId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var isAdmin=User.IsInRole("Admin");

            var members= await _projectMemberService.GetProjectMembers(projectId,userId,isAdmin);

            return Ok(members);
        }
        ///<summary>
        ///Proje üyesinin proje içindeki rolünü değiştir.
        ///</summary>
        [HttpPatch("{memberId}/role")]
        [Authorize(Roles ="Admin,ProjectManager")]
        public async Task<IActionResult> UpdateProjectMemberRole(int projectId,int memberId,UpdateProjectMemberRoleDto dto)
        {
            await _roleValidator.ValidateAndThrowAsync(dto);
            var userId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin= User.IsInRole("Admin");

            var member= await _projectMemberService.UpdateProjectMemberRole(projectId,memberId,dto,userId,isAdmin);
            return Ok(member);       
        }
    }
}
