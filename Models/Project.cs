using Microsoft.AspNetCore.SignalR;
using Microsoft.Net.Http.Headers;

namespace ProjectManagement.API.Models
{
public class Project
{
    public int Id {get;set;}
    public string Name {get;set;}= string.Empty;
    public string? Description{get;set;}
    public DateTime StartDate {get;set;}
    public DateTime? EndDate{get;set;}
    public ProjectStatus Status {get;set;} 
    public int OwnerId {get; set;}
    public User Owner {get; set;}= null!;
    public bool IsArchived {get;set;}= false;
    public DateTime? ArchivedAt {get;set;}
    public DateTime CreatedAt{get;set;}
    public DateTime? UpdatedAt {get;set;}
    public bool IsDeleted{get;set;}=false;
}

public enum ProjectStatus
{
    Planning,
    Active,
    OnHold,
    Completed,
    Cancelled
}
}