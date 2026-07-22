using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using ProjectManagement.API;
using ProjectManagement.API.Models;
using ProjectManagement.API.Services;
using ProjectManagement.API.Middleware;
using FluentValidation;
using ProjectManagement.API.Validators;
using System.Reflection;
using ProjectManagement.API.Swagger;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    { 
    Title = "Proje Yönetim Sistemi API", 
    Version = "v1", 
    Description="Kullanıcı, proje, görev,üyelik ve yorum işlemlerini yönetmek için geliştirilen API" 

    });

    c.TagActionsBy(api =>
    {
    var controllerName =api.ActionDescriptor.RouteValues["controller"];

    var tagName = controllerName switch
    {
        "Auth" => "Kayıt ve Giriş İşlemleri",
        "Comment" => "Yorumlar",
        "ProjectMember" => "Proje Üyeleri",
        "Projects" => "Projeler",
        "Tasks" => "Görevler",
    _ => controllerName ?? "Diğer İşlemler"
    };

    return new[] { tagName };

    });
    var xmlFile =$"{Assembly.GetExecutingAssembly().GetName().Name}.xml";

    var xmlPath = Path.Combine(AppContext.BaseDirectory,xmlFile);

    c.IncludeXmlComments(xmlPath);

    c.OperationFilter<AuthorizeOperationFilter>();
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "İlk olarak giriş yaparak JWT token alın. Ardından token değerini bu alana girin",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", document),
            new List<string>()
        }
    });
});

builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=projectmanagement.db"));

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<CommentService>();
builder.Services.AddScoped<ProjectMemberService>();
builder.Services.AddScoped<AuthService>();

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json","Proje Yönetim Sistemi API");
    options.DocumentTitle="Proje Yönetim Sistemi";
    options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);

    options.DefaultModelsExpandDepth(-1);
    options.DisplayRequestDuration();
    options.EnableFilter();
});

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    if (!context.Users.Any(u => u.Role == UserRole.Admin))
    {
        var admin = new User
        {
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        context.Users.Add(admin);
        context.SaveChanges();
    }
        if (!context.Users.Any(user =>
        user.Email == "manager@test.com"))
    {
        var projectManager = new User
        {
            FirstName = "Proje",
            LastName = "Yöneticisi",
            Email = "manager@test.com",
            PasswordHash =BCrypt.Net.BCrypt.HashPassword("Manager123!"),
            Role = UserRole.ProjectManager,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            IsDeleted = false
        };

        context.Users.Add(projectManager);
        context.SaveChanges();
    }
}
app.Run();
