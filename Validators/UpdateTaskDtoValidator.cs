using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class UpdateTaskDtoValidator
    : AbstractValidator<UpdateTaskDto>
{
    public UpdateTaskDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Görev başlığı zorunludur.")
            .MaximumLength(200)
            .WithMessage(
                "Görev başlığı en fazla 200 karakter olabilir.");

        RuleFor(x => x.Priority)
            .IsInEnum()
            .WithMessage(
                "Geçerli bir görev önceliği seçilmelidir.");

        RuleFor(x => x.EstimatedHours)
            .GreaterThanOrEqualTo(0)
            .WithMessage(
                "Tahmini süre negatif olamaz.");
    }
}