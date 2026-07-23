using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class UpdateProjectMemberRoleDtoValidator : AbstractValidator<UpdateProjectMemberRoleDto>
{
    public UpdateProjectMemberRoleDtoValidator()
    {
        RuleFor(x=>x.Role).IsInEnum().WithMessage("Geçerli bir proje rolü seçilmelidir.");
    }
}