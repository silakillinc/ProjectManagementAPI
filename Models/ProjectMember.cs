namespace ProjectManagement.API.Models
{
    public class ProjectMember
    {
        public int Id{get ;set;}
        public int ProjectId{get;set;}
        public Project Project{get;set;}=null!;
        public int UserId{get;set;}
        public User User{ get;set;}=null!;
        public ProjectMemberRole Role{get;set;}
        public DateTime JoinedAt{get;set;}
        public bool IsActive{get;set;}=false;
    }
    public enum ProjectMemberRole
    {
        Member,
        Contributor,
        Viewer
    }
} 
