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
     public async Task<Comment> CreateComment(int taskId,int userId, CreateCommentsDto dto)
        {
         var comment=new Comment{
        
           Content=dto.Content,
           TaskId=taskId,
           UserId=userId,
           CreatedAt=DateTime.UtcNow
        }; 
        _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return comment;   
        }
    }   
}