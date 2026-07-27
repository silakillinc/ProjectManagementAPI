using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.API.Services;
using System.Security.Claims;
using ProjectManagement.API.DTOs;
using FluentValidation;

namespace ProjectManagement.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles ="Admin")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly IValidator<UpdateUserRoleDto> _roleValidator;
    public UsersController(UserService userService,IValidator<UpdateUserRoleDto> roleValidator)
    {
        _userService=userService;
        _roleValidator=roleValidator;
    }

    ///<summary>
    ///Kullanıcıları Listele
    ///</summary>
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users= await _userService.GetUsers();
        return Ok(users);
    }

    ///<summary>
    ///Kullanıcıyı aktif veya pasif hale getir
    ///</summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult>UpdateUserStatus(int id,UpdateUsersStatusDto dto)
    {
        var currentUserId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var user= await _userService.UpdateUserStatus(id,dto,currentUserId);
        return Ok(user);
    }

    ///<summary>
    ///kullanıcının sistem rolünü değiştir
    ///</summary>
    
    [HttpPatch("{id}/role")]

    public async Task<IActionResult>UpdateUserRole(int id, UpdateUserRoleDto dto)
    {
        await _roleValidator.ValidateAndThrowAsync(dto);

        var currentUserId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var user=await _userService.UpdateUserRole(id,dto,currentUserId);

        return Ok(user);
    }
}
