using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.Exceptions;
using ProjectManagement.API.Models;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Mappings;


namespace ProjectManagement.API.Services
{
    public class CommentService{
     private readonly AppDbContext _context;
     public CommentService(AppDbContext context)
        {
           _context=context; 
        } 
     public async Task<CommentResponseDto> CreateComment(int taskId,int userId, CreateCommentsDto dto,bool isAdmin)
        {

         var task = await _context.Tasks.FirstOrDefaultAsync(task =>task.Id == taskId &&!task.IsDeleted);

         if (task == null)
      {
         throw new NotFoundException("Görev bulunamadı.");
      }

         var project = await _context.Projects.FirstOrDefaultAsync(project =>project.Id == task.ProjectId &&!project.IsDeleted);

         if (project == null)
      {
         throw new NotFoundException("Görevin projesi bulunamadı.");
      }

         var activeMember = await _context.ProjectMembers.FirstOrDefaultAsync(member =>member.ProjectId == task.ProjectId &&member.UserId == userId &&member.IsActive);

         var isProjectOwner = project.OwnerId == userId;

         var canComment =activeMember != null &&activeMember.Role != ProjectMemberRole.Viewer;

         if (!isAdmin && !isProjectOwner && !canComment)
      {
         throw new ForbiddenException("Bu göreve yorum ekleme yetkiniz yok.");
      }

         var comment=new Comment{
        
         Content=dto.Content,
         TaskId=taskId,
         UserId=userId,
         CreatedAt=DateTime.UtcNow
      }; 
        _context.Comments.Add(comment);
         await _context.SaveChangesAsync();
         return comment.ToResponseDto();   
        }
    }   
}