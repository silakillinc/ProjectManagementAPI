using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class AssignTaskDtoValidator
    : AbstractValidator<AssignTaskDto>
{
    public AssignTaskDtoValidator()
    {
        RuleFor(x => x.AssignedToUserId)
            .GreaterThan(0)
            .WithMessage("Geçerli bir kullanıcı seçilmelidir.");
    }
}