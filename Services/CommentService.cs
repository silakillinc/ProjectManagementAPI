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

     public async Task<List<CommentResponseDto>> GetComments(
        int taskId,
        int userId,
        bool isAdmin)
        {
         var task = await _context.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(task => task.Id == taskId && !task.IsDeleted);

         if (task is null)
         {
            throw new NotFoundException("Görev bulunamadı.");
         }

         var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(project =>
               project.Id == task.ProjectId && !project.IsDeleted);

         if (project is null)
         {
            throw new NotFoundException("Görevin projesi bulunamadı.");
         }

         var isProjectOwner = project.OwnerId == userId;

         var isActiveMember = await _context.ProjectMembers
            .AnyAsync(member =>
               member.ProjectId == task.ProjectId &&
               member.UserId == userId &&
               member.IsActive);

         if (!isAdmin && !isProjectOwner && !isActiveMember)
         {
            throw new ForbiddenException(
               "Bu görevin yorumlarını görüntüleme yetkiniz yok.");
         }

         var comments = await _context.Comments
            .AsNoTracking()
            .Where(comment =>
               comment.TaskId == taskId &&
               !comment.IsDeleted)
            .OrderBy(comment => comment.CreatedAt)
            .ToListAsync();

         return comments
            .Select(comment => comment.ToResponseDto())
            .ToList();
        }

     public async Task<CommentResponseDto> UpdateComment(
        int taskId,
        int commentId,
        int userId,
        UpdateCommentDto dto,
        bool isAdmin)
        {
         var taskExists = await _context.Tasks
            .AnyAsync(task => task.Id == taskId && !task.IsDeleted);

         if (!taskExists)
         {
            throw new NotFoundException("Görev bulunamadı.");
         }

         var comment = await _context.Comments
            .FirstOrDefaultAsync(comment =>
               comment.Id == commentId &&
               comment.TaskId == taskId &&
               !comment.IsDeleted);

         if (comment is null)
         {
            throw new NotFoundException("Yorum bulunamadı.");
         }

         if (!isAdmin && comment.UserId != userId)
         {
            throw new ForbiddenException(
               "Bu yorumu güncelleme yetkiniz yok.");
         }

         if (comment.Content == dto.Content)
         {
            throw new ConflictException(
               "Yeni yorum içeriği mevcut içerikle aynı.");
         }

         comment.Content = dto.Content;
         comment.UpdatedAt = DateTime.UtcNow;

         await _context.SaveChangesAsync();

         return comment.ToResponseDto();
        }
    }   
}
