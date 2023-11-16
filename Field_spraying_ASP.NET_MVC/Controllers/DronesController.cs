using Amazon.DynamoDBv2.DataModel;
using Microsoft.AspNetCore.Mvc;

namespace Field_spraying_ASP.NET_MVC.Controllers
{
    [Route("/drones")]
    [ApiController]
    public class DronesController : Controller
    {
        private readonly IDynamoDBContext _dynamoDBContext;
        private readonly IWebHostEnvironment _env;

        public DronesController(IDynamoDBContext dynamoDBContext, IWebHostEnvironment env)
        {
            _dynamoDBContext = dynamoDBContext;
            _env = env;
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}
