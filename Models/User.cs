

namespace ProjectManagement.API.Models{

public class User
{
    public int Id {get;set;}
    public string FirstName {get;set;}= string.Empty;
    public string LastName {get;set;}= string.Empty;
    public string Email {get;set;}=string.Empty;
    public string PasswordHash {get;set;}=string.Empty;
    public UserRole Role {get; set;}
     public string? Department { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
public enum UserRole
{
    Admin,
    ProjectManager,
    TeamMember
}
}