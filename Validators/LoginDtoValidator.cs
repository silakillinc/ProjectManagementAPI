using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("E-posta alanı zorunludur.")
            .EmailAddress()
            .WithMessage("Geçerli bir e-posta adresi girilmelidir.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Şifre alanı zorunludur.");
    }
}
