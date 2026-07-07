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
[Route("api/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
private readonly AppDbContext _context;
private readonly TaskService _taskService;
public TasksController(AppDbContext context, TaskService taskService)
{
_context = context;
_taskService = taskService;
}
[HttpPost]
public async Task<IActionResult> CreateTask(CreateTaskDto dto)
{
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
var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
var task = await _taskService.AssignTask(id, dto, userId);
return Ok(task); 
}
[HttpPatch("{id}/status")]
public async Task<IActionResult>UpdateStatus(int id, UpdateStatusDto dto)
{
    var userId= int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var status= await _taskService.UpdateStatus(id,dto.Status,userId);
    return Ok (status);
}
  }
    } 
