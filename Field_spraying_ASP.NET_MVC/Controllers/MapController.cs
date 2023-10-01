using Microsoft.AspNetCore.Mvc;

namespace Field_spraying_ASP.NET_MVC.Controllers
{
    [Route("/Map")]
    [ApiController]
    public class MapController : Controller
    {
        [HttpGet]   // GET /api/test2
        public IActionResult MapView()
        {
            return View();
        }

        [HttpPost("Export")]
        public async Task<IActionResult> Export(float[][] coords)
        {
            string list = "";
            for (int i = 0; i < coords.Length; i++)
            {
                list = list + " | " + String.Join(",", coords[i]);
            }
            return Json("EXPORT SUCCESSFUL : " + list);
            //return View();
        }
    }
}
