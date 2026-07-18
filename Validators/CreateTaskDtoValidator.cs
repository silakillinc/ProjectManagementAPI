using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class CreateTaskDtoValidator
    : AbstractValidator<CreateTaskDto>
{
    public CreateTaskDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Görev başlığı zorunludur.")
            .MaximumLength(200)
            .WithMessage("Görev başlığı en fazla 200 karakter olabilir.");

        RuleFor(x => x.ProjectId)
            .GreaterThan(0)
            .WithMessage("Geçerli bir proje seçilmelidir.");

        RuleFor(x => x.EstimatedHours)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Tahmini süre negatif olamaz.");

        RuleFor(x => x.AssignedToUserId)
            .GreaterThan(0)
            .When(x => x.AssignedToUserId.HasValue)
            .WithMessage("Geçerli bir kullanıcı seçilmelidir.");

        RuleFor(x => x.Priority)
            .IsInEnum()
            .WithMessage("Geçerli bir görev önceliği seçilmelidir.");
    }
}