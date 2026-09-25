using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApiDotNet.Data.Entities;
using WebApiDotNet.Models.Account;
using WebApiDotNet.Services;

namespace WebApiDotNet.Controllers;

[Route("api/[controller]/[action]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly UserManager<UserEntity> _userManager;
    private readonly SignInManager<UserEntity> _signInManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IImageService _imageService;

    public AccountController(
        UserManager<UserEntity> userManager,
        SignInManager<UserEntity> signInManager,
        IJwtTokenService jwtTokenService,
        IImageService imageService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenService = jwtTokenService;
        _imageService = imageService;
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user is null)
        {
            return Unauthorized(new { message = "Невірний email або пароль" });
        }

        var checkPassword = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
        if (!checkPassword.Succeeded)
        {
            return Unauthorized(new { message = "Невірний email або пароль" });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.GenerateToken(user, roles);

        var response = new LoginResponseModel
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Image = user.Image,
            Roles = roles
        };

        return Ok(response);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Register([FromForm] RegisterModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingUser = await _userManager.FindByEmailAsync(model.Email);
        if (existingUser is not null)
        {
            return BadRequest(new { message = "Користувач з таким email вже існує" });
        }

        string imageName;
        try
        {
            imageName = await _imageService.SaveImageAsync(model.Image);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        var user = new UserEntity
        {
            UserName = model.Email,
            Email = model.Email,
            EmailConfirmed = true,
            FirstName = model.FirstName,
            LastName = model.LastName,
            Image = imageName
        };

        var createResult = await _userManager.CreateAsync(user, model.Password);
        if (!createResult.Succeeded)
        {
            _imageService.DeleteImageIfExists(imageName);
            return BadRequest(new { errors = createResult.Errors.Select(e => e.Description) });
        }

        await _userManager.AddToRoleAsync(user, "User");

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.GenerateToken(user, roles);

        var response = new LoginResponseModel
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Image = user.Image,
            Roles = roles
        };

        return Ok(response);
    }
}
