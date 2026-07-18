using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class CreateProjectDtoValidator
    : AbstractValidator<CreateProjectDto>
{
    public CreateProjectDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Proje adı zorunludur.")
            .MaximumLength(200)
            .WithMessage("Proje adı en fazla 200 karakter olabilir.");

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .WithMessage("Başlangıç tarihi zorunludur.");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .When(x => x.EndDate.HasValue)
            .WithMessage(
                "Bitiş tarihi başlangıç tarihinden önce olamaz.");
    }
}