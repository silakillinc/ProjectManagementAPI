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
[Route("api/tasks/{tasksId}/comments")]
[Authorize] 

public class CommentController:ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CommentService _commentService;
        public CommentController(AppDbContext context, CommentService commentService)
        {
            _context=context;
            _commentService=commentService;
        }  
      [HttpPost]
      public async Task<IActionResult>CreateComment(int taskId, CreateCommentsDto dto)
        {
          var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!); 
          var comment= await _commentService.CreateComment(userId,dto);
          return Ok (comment);
        }  
    }
}