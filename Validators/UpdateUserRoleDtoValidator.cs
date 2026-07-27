using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class UpdateUserRoleDtoVValidator : AbstractValidator<UpdateUserRoleDto>
{
    public UpdateUserRoleDtoVValidator()
    {
        RuleFor(x=> x.Role).IsInEnum().WithMessage("Geçerli bir sistem rolü seçin.");
    }
}