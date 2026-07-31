using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Services;
using System.Security.Claims;

namespace ProjectManagement.API.Controllers;

[ApiController]
[Route("api/tasks/{taskId}/time-logs")]
[Authorize] 
public class TaskTimeLogController: ControllerBase
{
    private readonly TaskTimeLogService _timeLogService;
    private readonly IValidator <CreateTaskTimeLogDto> _validator;
    public TaskTimeLogController(TaskTimeLogService timeLogService, IValidator <CreateTaskTimeLogDto> validator)
    {
        _timeLogService=timeLogService;
        _validator= validator;
    }

    ///<summary>
    ///Göreve çalışma süresi ekle
    ///</summary>

    [HttpPost]
    public async Task<IActionResult> CreateTimeLog(int taskId, CreateTaskTimeLogDto dto)
    {
        await _validator.ValidateAndThrowAsync(dto);

        var userId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin=User.IsInRole("Admin");

        var timeLog=await _timeLogService.CreateTimeLog(taskId,userId,dto,isAdmin);

        return Ok(timeLog);
    }
    ///<summary>
    ///Göreve ait zaman kayıtlarını ve toplam süreyi listele
    ///</summary>
    
    [HttpGet]
    public async Task<IActionResult>GetTimeLogs(int taskId,[FromQuery] int? userId,
    [FromQuery] DateTime? workDate)
    {
        var currentUserId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var isAdmin=User.IsInRole("Admin");

        var result= await _timeLogService.GetTimeLogs(taskId,currentUserId,isAdmin,userId,workDate);

        return Ok(result);
    }
}