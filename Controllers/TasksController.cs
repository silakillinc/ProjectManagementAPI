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
private readonly AppDbContext _context;
private readonly TaskService _taskService;
private readonly IValidator<CreateTaskDto> _createTaskValidator;
private readonly IValidator<AssignTaskDto> _assignTaskValidator;
private readonly IValidator<UpdateStatusDto> _updateStatusValidator;
public TasksController(AppDbContext context, TaskService taskService,IValidator<CreateTaskDto> createTaskValidator,IValidator<AssignTaskDto> assignTaskValidator,
    IValidator<UpdateStatusDto> updateStatusValidator)
{
_context = context;
_taskService = taskService;
_createTaskValidator = createTaskValidator;
_assignTaskValidator = assignTaskValidator;
_updateStatusValidator = updateStatusValidator;
}

[HttpPost]
[Authorize(Roles = "Admin,ProjectManager")]
public async Task<IActionResult> CreateTask(CreateTaskDto dto)
{
  await _createTaskValidator.ValidateAndThrowAsync(dto);

  var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

  var task = await _taskService.CreateTask(dto, userId);
  return Ok(task);
}
[HttpGet]
public async Task<IActionResult> getTask()
{
var tasks= await _context.Tasks
.Where(t=> !t.IsDeleted)
.ToListAsync();
return Ok (tasks);
}

[HttpPut("{id}/assign")]
public async Task<IActionResult> AssignTask(int id, AssignTaskDto dto)
{
await _assignTaskValidator.ValidateAndThrowAsync(dto);

var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
var task = await _taskService.AssignTask(id, dto, userId);

return Ok(task); 
}

[HttpPatch("{id}/status")]
public async Task<IActionResult>UpdateStatus(int id, UpdateStatusDto dto)
{
  await _updateStatusValidator.ValidateAndThrowAsync(dto);

  var userId= int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
  var status= await _taskService.UpdateStatus(id,dto.Status,userId);
  return Ok (status);
}
  }
    } 
