using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using DynamoDb.Libs.DynamoDb;
using System.Runtime.CompilerServices;
using Field_spraying_ASP.NET_MVC.Services;
using Field_spraying_ASP.NET_MVC;
using Amazon.Auth.AccessControlPolicy;
using System.Net;

namespace Field_spraying_ASP.NET_MVC.Controllers
{
    [Route("/authorization")]
    [ApiController]
    public class AuthorizationController : Controller
    {
        private readonly IDynamoDb _dynamoDb;
        private readonly IPasswordHasherService _passwordHasher;
        private readonly string _pepper;
        private readonly int _iteration = 3;

        public AuthorizationController(IDynamoDb dynamoDb, IPasswordHasherService passwordHasherService)
        {
            _dynamoDb = dynamoDb;
            _passwordHasher = passwordHasherService;
            _pepper = Environment.GetEnvironmentVariable("PasswordHashPepper");
        }

        [Route("login")]
        [Route("/")]
        [HttpGet]
        public IActionResult LoginView()
        {
            return View();
        }

        [Route("login")]
        [HttpPost]
        public async Task<ActionResult> Login([FromBody] ViewModels.User userFromView)
        {
            Models.User userFromDb = await _dynamoDb.GetObject<Models.User>(userFromView.Username);

            if (userFromDb == null)
            {
                Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return Json(new { Message = "Користувача з таким іменем не існує" });
            }

            string passwordHash = _passwordHasher.GenerateHash(userFromView.Password, userFromDb.PasswordSalt, _pepper, _iteration);

            if (userFromDb.PasswordHash == passwordHash)
            {
                // Creating Cookie for Authorize
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, userFromDb.Username),
                    new Claim(ClaimTypes.Role, "Administrator"),
                };

                var claimsIdentity = new ClaimsIdentity(
                    claims, CookieAuthenticationDefaults.AuthenticationScheme);

                var authProperties = new AuthenticationProperties
                {
                    AllowRefresh = true,
                    // Refreshing the authentication session should be allowed.

                    //ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(10),
                    // The time at which the authentication ticket expires. A 
                    // value set here overrides the ExpireTimeSpan option of 
                    // CookieAuthenticationOptions set with AddCookie.

                    //IsPersistent = true,
                    // Whether the authentication session is persisted across 
                    // multiple requests. When used with cookies, controls
                    // whether the cookie's lifetime is absolute (matching the
                    // lifetime of the authentication ticket) or session-based.

                    //IssuedUtc = <DateTimeOffset>,
                    // The time at which the authentication ticket was issued.

                    RedirectUri = "/"
                    // The full path or absolute URI to be used as an http 
                    // redirect response value.
                };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                return Json(new { redirectToUrl = Url.Action("", "map") });
            }
            else
            {
                Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return Json(new { Message = "Неправильний пароль" });
            }
        }

        [Route("logout")]
        [HttpPost]
        public async Task<IActionResult> LogOut()
        {
            // Clear the existing external cookie
            await HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme);

            return Json(new { redirectToUrl = "/" });
        }

        [Route("register")]
        [HttpGet]
        public IActionResult RegistrationView()
        {
            return View();
        }

        [Route("register")]
        [HttpPost]
        public async Task<ActionResult> RegisterUser([FromBody] ViewModels.User userFromView)
        {
            string userName = userFromView.Username;
            string salt = _passwordHasher.GenerateSalt();
            string passwordHash = _passwordHasher.GenerateHash(userFromView.Password, salt, _pepper, _iteration);

            Models.User newUser = new Models.User() {
                Username = userName,
                PasswordSalt = salt,
                PasswordHash = passwordHash
            };

            bool saveSuccess = await _dynamoDb.PutObject<Models.User>(newUser, "Username");

            if (saveSuccess)
            {
                return Json(new { redirectToUrl = "/" });
            }
            else
            {
                Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return Json(new { Message = "Користувач з таким іменем вже зареєстрований." });
            }
        }
    }
}
