using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
      RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("Ad alanı zorunludur.")
            .MaximumLength(50)
            .WithMessage("Ad en fazla 50 karakter olabilir.");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Soyad alanı zorunludur.")
            .MaximumLength(50)
            .WithMessage("Soyad en fazla 50 karakter olabilir.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("E-posta alanı zorunludur.")
            .EmailAddress()
            .WithMessage("Geçerli bir e-posta adresi girilmelidir.")
            .MaximumLength(200)
            .WithMessage("E-posta en fazla 200 karakter olabilir.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Şifre alanı zorunludur.")
            .MinimumLength(6)
            .WithMessage("Şifre en az 6 karakter olmalıdır.")
            .MaximumLength(100)
            .WithMessage("Şifre en fazla 100 karakter olabilir.");  
    }
}
