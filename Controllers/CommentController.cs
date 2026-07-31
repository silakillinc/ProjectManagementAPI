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
        private readonly IValidator<UpdateCommentDto> _updateCommentValidator;
        public CommentController(
          CommentService commentService,
          IValidator<CreateCommentsDto> commentValidator,
          IValidator<UpdateCommentDto> updateCommentValidator)
        {
            
          _commentService=commentService;
          _commentValidator = commentValidator;
          _updateCommentValidator = updateCommentValidator;
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

      /// <summary>
      /// Göreve ait aktif yorumları listele
      /// </summary>

      [HttpGet]
      public async Task<IActionResult>GetComments(int taskId)
        {
          var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

          var isAdmin = User.IsInRole("Admin");

          var comments = await _commentService.GetComments(
            taskId,
            userId,
            isAdmin);

          return Ok(comments);
        }

      /// <summary>
      /// Yorumu güncelle
      /// </summary>

      [HttpPut("{commentId}")]
      public async Task<IActionResult>UpdateComment(
        int taskId,
        int commentId,
        UpdateCommentDto dto)
        {
          await _updateCommentValidator.ValidateAndThrowAsync(dto);

          var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

          var isAdmin = User.IsInRole("Admin");

          var comment = await _commentService.UpdateComment(
            taskId,
            commentId,
            userId,
            dto,
            isAdmin);

          return Ok(comment);
        }

      /// <summary>
      /// Yorumu sil
      /// </summary>

      [HttpDelete("{commentId}")]
      public async Task<IActionResult>DeleteComment(
        int taskId,
        int commentId)
        {
          var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

          var isAdmin = User.IsInRole("Admin");

          await _commentService.DeleteComment(
            taskId,
            commentId,
            userId,
            isAdmin);

          return NoContent();
        }
    }
}
