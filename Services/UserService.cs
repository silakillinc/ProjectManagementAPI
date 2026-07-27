using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.DTOs.Responses;
using ProjectManagement.API.Models;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Exceptions;
using System.Diagnostics;
using System.Security.Cryptography.X509Certificates;

namespace ProjectManagement.API.Services;

public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context=context;
    }
    public async Task <List<UserResponseDto>> GetUsers()
    {
        return await _context.Users.Where(user=> !user.IsDeleted).OrderBy(user =>user.Id).Select(user=>new UserResponseDto{
            Id=user.Id,
            FirstName=user.FirstName,
            LastName=user.LastName,
            Email=user.Email,
            Role=user.Role.ToString(),
            Department=user.Department,
            IsActive=user.IsActive,
            CreatedAt=user.CreatedAt

        }).ToListAsync();
    }public async Task<UserResponseDto>UpdateUserStatus(int id,UpdateUsersStatusDto dto, int currentUserId)
    {
        var user=await _context.Users.FirstOrDefaultAsync(user=> user.Id== id && !user.IsDeleted);
        if (user is null)
        {
            throw new NotFoundException("Kullanıcı bulunamadı.");
        }
        if(user.Id==currentUserId && !dto.IsActive)
        {
            throw new BadRequestException("Admin kendi hesabını pasif hale alamaz");
        }
        if (user.IsActive == dto.IsActive)
        {
            throw new ConflictException(dto.IsActive?"Kullanıcı zaten aktif":"Kullanıcı zaten pasif");
      
        }
        user.IsActive=dto.IsActive;
        user.UpdatedAt=DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new UserResponseDto
        {
            Id=user.Id,
            FirstName=user.FirstName,
            LastName=user.LastName,
            Email=user.Email,
            Role=user.Role.ToString(),
            Department=user.Department,
            IsActive=user.IsActive,
            CreatedAt=user.CreatedAt
        };
    }
    public async Task<UserResponseDto>UpdateUserRole(int id,UpdateUserRoleDto dto,int currentUserId)
    {
        var user= await _context.Users.FirstOrDefaultAsync(user=> user.Id== id && !user.IsDeleted);
        if(user is null)
        {
            throw new NotFoundException("Kullanıcı bulunamadı.");
        }
        if (user.Id == currentUserId)
        {
            throw new BadRequestException("Admin kendi sistem rolünü değiştiremez");
        }
        if (user.Role == dto.Role)
        {
            throw new ConflictException("Kullanıcı zaten bu sistem rolüne sahip");
        }
        user.Role=dto.Role;
        user.UpdatedAt=DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new UserResponseDto
        {
            Id=user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role.ToString(),
            Department = user.Department,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
    
}