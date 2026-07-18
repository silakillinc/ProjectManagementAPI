using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class CreateCommentsDtoValidator
    : AbstractValidator<CreateCommentsDto>
{
    public CreateCommentsDtoValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty()
            .WithMessage("Yorum içeriği zorunludur.")
            .MaximumLength(2000)
            .WithMessage("Yorum en fazla 2000 karakter olabilir.");
    }
}