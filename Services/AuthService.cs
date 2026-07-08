using ProjectManagement.API.Models;
using ProjectManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace ProjectManagement.API.Services
{
public class AuthService
{
private readonly AppDbContext _context;
private readonly TokenService _tokenService;

public AuthService(AppDbContext context ,TokenService tokenService)
{
    _context=context;
    _tokenService=tokenService;
}
public async Task<string>Register(RegisterDto dto)
{
if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        throw new Exception("Bu email zaten kayıtlı.");
var user = new User
{
    FirstName=dto.FirstName,
    LastName=dto.LastName,
    Email=dto.Email,
    PasswordHash=BCrypt.Net.BCrypt.HashPassword(dto.Password),
    IsActive=true,
    CreatedAt=DateTime.UtcNow,
    Role=UserRole.TeamMember
};
    _context.Users.Add(user);
    await _context.SaveChangesAsync();
    return "Kayit Basarili" ;
}
public async Task<string>Login(LoginDto dto)
        {
          var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);  
          if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
              throw new Exception ("Email veya sifre hatali.");
            }
              return _tokenService.CreateToken(user);
            
        }
    }
}