using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class UpdateCommentDtoValidator
    : AbstractValidator<UpdateCommentDto>
{
    public UpdateCommentDtoValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty()
            .WithMessage("Yorum içeriği zorunludur.")
            .MaximumLength(2000)
            .WithMessage("Yorum en fazla 2000 karakter olabilir.");
    }
}
