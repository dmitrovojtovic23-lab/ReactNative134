using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace WebApiDotNet.Models.Account;

public class RegisterModel
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = null!;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [Required]
    public IFormFile Image { get; set; } = null!;
}
