using ProjectManagement.API.Common;
using ProjectManagement.API.Exceptions;
using FluentValidation;

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
        catch (ValidationException exception)
{
    _logger.LogWarning(
        exception,
        "İstek validasyon hatası ile sonuçlandı.");

    var errors = exception.Errors
        .GroupBy(error => error.PropertyName)
        .ToDictionary(
            group => group.Key,
            group => group
                .Select(error => error.ErrorMessage)
                .ToArray());

    context.Response.StatusCode =
        StatusCodes.Status400BadRequest;

    await context.Response.WriteAsJsonAsync(new
    {
        statusCode = StatusCodes.Status400BadRequest,
        message = "Validasyon hatası oluştu.",
        errors
    });
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