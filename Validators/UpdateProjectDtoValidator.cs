using System.Diagnostics.Contracts;
using FluentValidation;
using ProjectManagement.API.DTOs;

namespace ProjectManagement.API.Validators;

public class UpdateProjectDtoValidator:AbstractValidator<UpdateProjectDto>
{
    public UpdateProjectDtoValidator()
    {
        RuleFor(project=> project.Name).NotEmpty().WithMessage("Proje Adı Zorunludur.").MaximumLength(200).WithMessage("Proje Adı En Fazla 200 Karakter Olabilir");
        RuleFor(project=>project.StartDate).NotEmpty().WithMessage("Başlangıç Tarihi Zorunludur");
        RuleFor(project=>project.EndDate).GreaterThanOrEqualTo(project=>project.StartDate).When(project=>project.EndDate.HasValue).WithMessage(
            "Bitiş Tarihi Başlangıç Tarihinden Önce Olamaz");
        RuleFor(project=> project.Status).IsInEnum().WithMessage("Geçerli bir proje durumu seçilmelidir");
    }
}
