using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.API.DTOs;
using ProjectManagement.API.Services;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly IValidator<RegisterDto> _registerValidator;
        private readonly IValidator<LoginDto> _loginValidator;

        public AuthController(
            AuthService authService,
            IValidator<RegisterDto> registerValidator,
            IValidator<LoginDto> loginValidator)
        {
            _authService = authService;
            _registerValidator = registerValidator;
            _loginValidator = loginValidator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            await _registerValidator.ValidateAndThrowAsync(dto);

            var result = await _authService.Register(dto);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            await _loginValidator.ValidateAndThrowAsync(dto);

            var token = await _authService.Login(dto);
            return Ok(new { token });
        }
    }
}