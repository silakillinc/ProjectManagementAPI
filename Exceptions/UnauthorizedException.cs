namespace ProjectManagement.API.Exceptions;

public class UnauthorizedException : ApiException
{
    public UnauthorizedException(string message)
        : base(message, StatusCodes.Status401Unauthorized)
    {
    }
}