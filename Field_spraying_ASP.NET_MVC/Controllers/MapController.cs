using Amazon.DynamoDBv2.DataModel;
using Field_spraying_ASP.NET_MVC.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Field_spraying_ASP.NET_MVC.Controllers
{
    [Route("/Map")]
    [ApiController]
    public class MapController : Controller
    {
        private readonly IDynamoDBContext _dynamoDBContext;

        public MapController(IDynamoDBContext dynamoDBContext)
        {
            _dynamoDBContext = dynamoDBContext;
        }

        [HttpGet]   // GET /map
        public IActionResult MapView()
        {
            return View();
        }

        [Route("get/{name}")]
        [HttpGet]   // GET /map/get/{name}
        public async Task<IActionResult> Get(string name)
        {
            var area = await _dynamoDBContext.LoadAsync(name);

            return Ok(area);
        }

        [Route("Export")]
        [HttpPost]
        public async Task<IActionResult> Export([FromBody] JsonElement formData)
        {
            //Guid uuid = Guid.NewGuid();
            //string uuidAsString = uuid.ToString();
            var areaName = formData.GetProperty("area_name").ToString();
            var coords = formData.GetProperty("coords").Deserialize<double[][]>();
            

            Area area = new Area() {
                //Id = uuidAsString,
                Name = areaName,
                Coords = coords
            };

            await _dynamoDBContext.SaveAsync(area);

            string list = "";
            for (int i = 0; i < coords.Length; i++)
            {
                list = list + " | " + String.Join(",", coords[i]);
            }
            return Ok("EXPORT SUCCESSFUL : " + list);
        }

        [Route("Import")]
        [HttpGet]   // GET /map/import
        public async Task<IActionResult> Import()
        {
            var area = await _dynamoDBContext.LoadAsync<Area>("area_1");
            return Ok(area);
        }
    }
}
