namespace ProjectManagement.API.Exceptions;

public class ConflictException : ApiException
{
    public ConflictException(string message)
        : base(message, StatusCodes.Status409Conflict)
    {
    }
}