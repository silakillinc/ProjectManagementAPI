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
[Route("api/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
private readonly TaskService _taskService;
private readonly IValidator<CreateTaskDto> _createTaskValidator;
private readonly IValidator<AssignTaskDto> _assignTaskValidator;
private readonly IValidator<UpdateStatusDto> _updateStatusValidator;
public TasksController(TaskService taskService,IValidator<CreateTaskDto> createTaskValidator,IValidator<AssignTaskDto> assignTaskValidator,
    IValidator<UpdateStatusDto> updateStatusValidator)
{
_taskService = taskService;
_createTaskValidator = createTaskValidator;
_assignTaskValidator = assignTaskValidator;
_updateStatusValidator = updateStatusValidator;
}

/// <summary>
/// Yeni bir görev oluştur.
/// </summary>

[HttpPost]
[Authorize(Roles = "Admin,ProjectManager")]
public async Task <IActionResult> CreateTask(CreateTaskDto dto)
{
  await _createTaskValidator.ValidateAndThrowAsync(dto);

  var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

  var isAdmin =User.IsInRole("Admin");
  var task = await _taskService.CreateTask(dto,userId,isAdmin);

  return Ok(task);
}

/// <summary>
/// Kullanıcının Erişebildiği Görevleri
/// </summary>

[HttpGet]
public async Task<IActionResult> GetTasks()
{
var userId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

var isAdmin=User.IsInRole("Admin");

var tasks =await _taskService.GetTasks(userId,isAdmin);
return Ok (tasks);
}

/// <summary>
/// Aktif Proje Üyesine Görev Ata
/// </summary>

[HttpPut("{id}/assign")]
[Authorize(Roles = "Admin,ProjectManager")]
public async Task<IActionResult> AssignTask(int id, AssignTaskDto dto)
{
await _assignTaskValidator.ValidateAndThrowAsync(dto);

var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
var isAdmin=User.IsInRole("Admin");
var task = await _taskService.AssignTask(id,dto,userId,isAdmin);

return Ok(task); 
}

/// <summary>
/// Görev durumunu güncelle
/// </summary>


[HttpPatch("{id}/status")]
public async Task<IActionResult> UpdateStatus(
    int id,
    UpdateStatusDto dto)
{
    await _updateStatusValidator.ValidateAndThrowAsync(dto);

    var userId = int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var isAdmin = User.IsInRole("Admin");

    var task = await _taskService.UpdateStatus(id,dto.Status,userId,isAdmin);

    return Ok(task);
}
  }
    } 
