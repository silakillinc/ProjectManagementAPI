using ProjectManagement.API.Common;
using ProjectManagement.API.Exceptions;

namespace ProjectManagement.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ApiException exception)
        {
            _logger.LogWarning(
                exception,
                "API isteği hata ile sonuçlandı: {Message}",
                exception.Message);

            await WriteErrorResponseAsync(
                context,
                exception.StatusCode,
                exception.Message);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Beklenmeyen bir uygulama hatası oluştu.");

            await WriteErrorResponseAsync(
                context,
                StatusCodes.Status500InternalServerError,
                "Beklenmeyen bir hata oluştu.");
        }
    }

    private static async Task WriteErrorResponseAsync(
        HttpContext context,
        int statusCode,
        string message)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse
        {
            StatusCode = statusCode,
            Message = message
        };

        await context.Response.WriteAsJsonAsync(response);
    }
}