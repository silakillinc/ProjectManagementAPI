using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class CreateTaskTimeLogDtoValidator:AbstractValidator<CreateTaskTimeLogDto>
{
    public CreateTaskTimeLogDtoValidator()
    {
        RuleFor(x => x.Hours)
            .GreaterThan(0)
            .WithMessage("Çalışma süresi sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Açıklama en fazla 500 karakter olabilir.");

        RuleFor(x => x.WorkDate)
            .NotEmpty()
            .WithMessage("Çalışma tarihi zorunludur.");
    }
}