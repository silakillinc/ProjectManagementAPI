using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ProjectManagement.API.Swagger;

public class AuthorizeOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation,OperationFilterContext context)
    {
        var controllerHasAuthorize =context.MethodInfo.DeclaringType?.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any() == true;

        var methodHasAuthorize =context.MethodInfo.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any();

        var allowAnonymous =context.MethodInfo.GetCustomAttributes(true).OfType<AllowAnonymousAttribute>().Any();

        var requiresAuthorization =!allowAnonymous &&(controllerHasAuthorize || methodHasAuthorize);

        if (!requiresAuthorization)
        {
            operation.Security=new List<OpenApiSecurityRequirement>();
        }
    }
}