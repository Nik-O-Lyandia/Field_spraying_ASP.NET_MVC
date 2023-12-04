using Field_spraying_ASP.NET_MVC.Models;
using Microsoft.AspNetCore.Mvc;

namespace Field_spraying_ASP.NET_MVC.Controllers
{
    [Route("/registration")]
    [ApiController]
    public class RegistrationController : Controller
    {
        [HttpGet]
        public IActionResult RegistrationView()
        {
            return View();
        }

        [Route("register")]
        [HttpPost]
        public ActionResult RegisterUser([FromBody] User user)
        {
            // Perform user registration logic here (e.g., store user information in a database)
            // Note: In a real-world scenario, you would likely use a more secure registration process.
            // This is a basic example for illustration purposes.

            if (true)
            {
                return Json(new { redirectToUrl = Url.Action("","login") });
            }
            else
            {
                return BadRequest(false);
            }
        }
    }
}
