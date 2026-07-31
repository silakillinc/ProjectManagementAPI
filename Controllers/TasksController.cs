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
private readonly IValidator<UpdateTaskDto> _updateTaskValidator;
public TasksController(TaskService taskService,IValidator<CreateTaskDto> createTaskValidator,IValidator<AssignTaskDto> assignTaskValidator,
    IValidator<UpdateStatusDto> updateStatusValidator,IValidator<UpdateTaskDto> updateTaskValidator)
{
_taskService = taskService;
_createTaskValidator = createTaskValidator;
_assignTaskValidator = assignTaskValidator;
_updateStatusValidator = updateStatusValidator;
_updateTaskValidator = updateTaskValidator;
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

/// <summary>
/// Görev değişiklik geçmişi.
/// </summary>

[HttpGet("{taskId}/histories")]
public async Task<IActionResult>GetTaskHistories(int taskId)
    {
      var userId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

      var isAdmin=User.IsInRole("Admin");

      var histories =await _taskService.GetTaskHistories(taskId,userId,isAdmin);

      return Ok(histories);     
    }
/// <summary>
/// Görev detayını görüntüle
/// </summary>
/// 
[HttpGet("{id}")]
public async Task<IActionResult> GetTaskById(int id)
    {
       var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

       var isAdmin = User.IsInRole("Admin");

       var task = await _taskService.GetTaskById(id,userId,isAdmin);  
       return Ok(task);
    }
/// <summary>
/// Görev bilgilerini güncelle
/// </summary>

[HttpPut("{id}")]
[Authorize(Roles = "Admin,ProjectManager")]

public async Task<IActionResult> UpdateTask(int id,UpdateTaskDto dto)

      {
        await _updateTaskValidator.ValidateAndThrowAsync(dto);

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var isAdmin = User.IsInRole("Admin");

        var task = await _taskService.UpdateTask(id,dto,userId,isAdmin);

        return Ok(task);    
      }
/// <summary>
/// Görevi sil.
/// </summary>
/// 
[HttpDelete("{id}")]
[Authorize(Roles = "Admin,ProjectManager")]
public async Task<IActionResult> DeleteTask(int id)
        {
          var userId=int.Parse( User.FindFirstValue(ClaimTypes.NameIdentifier)!);
          var isAdmin = User.IsInRole("Admin");

          await _taskService.DeleteTask(id, userId, isAdmin);

          return NoContent();
        }
    }
  } 
