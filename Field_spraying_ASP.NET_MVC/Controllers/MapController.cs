using Amazon.DynamoDBv2.DataModel;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

using Field_spraying_ASP.NET_MVC.Models;
using System.Diagnostics;
using System.Globalization;

namespace Field_spraying_ASP.NET_MVC.Controllers
{
    [Route("/Map")]
    [ApiController]
    public class MapController : Controller
    {
        private readonly IDynamoDBContext _dynamoDBContext;
        private readonly IWebHostEnvironment _env;

        public MapController(IDynamoDBContext dynamoDBContext, IWebHostEnvironment env)
        {
            _dynamoDBContext = dynamoDBContext;
            _env = env;
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
        [HttpPost]      // POST /map/import
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

        [Route("Build_trajectory")]
        [HttpGet]   // GET /map/build_trajectory
        public IActionResult Build_trajectory(string area_name, string spraying_radius)
        {
            string contentRootPath = _env.ContentRootPath;
            string cppFilePath = contentRootPath + @"\python_algorithms\main.py";
            float r;
            
            if (float.TryParse(spraying_radius, out r))
            {
                CmdRun cmdRun = new CmdRun();
                var route = cmdRun.Run(cppFilePath, "-a " + area_name + " -r " + spraying_radius.ToString());

                Debug.WriteLine(route);

                var routeCoords = route.Split(",");
                double[][] routeArray = new double[routeCoords.Length / 2][];

                string firstCoordinate = "";
                string secondCoordinate = "";
                for (int i = 0; i < routeCoords.Length; i++)
                {
                    if (i % 2 == 0)
                    {
                        firstCoordinate = routeCoords[i];
                        firstCoordinate = firstCoordinate.Trim();
                        if (firstCoordinate.IndexOf('[') != -1) firstCoordinate = firstCoordinate.Remove(firstCoordinate.IndexOf('['), 1);
                        if (firstCoordinate.IndexOf('(') != -1) firstCoordinate = firstCoordinate.Remove(firstCoordinate.IndexOf('('), 1);
                    }
                    if (i % 2 == 1)
                    {
                        secondCoordinate = routeCoords[i];
                        secondCoordinate = secondCoordinate.Trim();
                        if (secondCoordinate.IndexOf(')') != -1) secondCoordinate = secondCoordinate.Remove(secondCoordinate.IndexOf(')'), 1);
                        if (secondCoordinate.IndexOf(']') != -1) secondCoordinate = secondCoordinate.Remove(secondCoordinate.IndexOf(']'), 1);
                        var coord1 = double.Parse(firstCoordinate, NumberStyles.Any, CultureInfo.InvariantCulture);
                        var coord2 = double.Parse(secondCoordinate, NumberStyles.Any, CultureInfo.InvariantCulture);

                        routeArray[i / 2] = new double[2];
                        routeArray[i / 2][0] = coord1;
                        routeArray[i / 2][1] = coord2;
                    }
                }

                return Ok(routeArray);
            }
            else
            {
                return BadRequest("Spraying radius has incorrect format (must be INT or FLOAT).");
            }

        }
    }
}
