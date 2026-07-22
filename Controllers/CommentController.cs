using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Models;
using ProjectManagement.API.Services;
using FluentValidation;
using ProjectManagement.API.Exceptions;
using ProjectManagement.API.DTOs.Responses;

namespace ProjectManagement.API.Controllers
{
[ApiController]
[Route("api/tasks/{taskId}/comments")]
[Authorize] 

public class CommentController:ControllerBase
    {
        private readonly CommentService _commentService;
        private readonly IValidator<CreateCommentsDto> _commentValidator;
        public CommentController(CommentService commentService,IValidator<CreateCommentsDto> commentValidator)
        {
            
            _commentService=commentService;
            _commentValidator = commentValidator;
        }  

      /// <summary>
      /// Yeni yorum ekle
      /// </summary>

      [HttpPost]
      public async Task<IActionResult>CreateComment(int taskId, CreateCommentsDto dto)
        {
          await _commentValidator.ValidateAndThrowAsync(dto);

          var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!); 
          
          var isAdmin=User.IsInRole("Admin");

          var comment= await _commentService.CreateComment(taskId,userId,dto,isAdmin);
          
          return Ok (comment);
        }  
    }
}