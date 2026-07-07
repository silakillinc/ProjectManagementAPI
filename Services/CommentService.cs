using ProjectManagement.API.Models;
using ProjectManagement.API.DTOs;


namespace ProjectManagement.API.Services
{
    public class CommentService{
     private readonly AppDbContext _context;
     public CommentService(AppDbContext context)
        {
           _context=context; 
        } 
     public async Task<Comment> CreateComment(int userId, CreateCommentsDto dto)
        {
         var comments=new Comment{
        
           Content=dto.Content,
           TaskId=dto.TaskId,
           UserId=userId,
           CreatedAt=DateTime.UtcNow
        }; 
        _context.Comments.Add(comments);
            await _context.SaveChangesAsync();
            return comments;   
        }
    }   
}