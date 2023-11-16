using Amazon.DynamoDBv2.DataModel;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

using Field_spraying_ASP.NET_MVC.Models;
using System.Diagnostics;
using System.Globalization;
using System.Net;
using Amazon.DynamoDBv2;
using DynamoDb.Libs.DynamoDb;

namespace Field_spraying_ASP.NET_MVC.Controllers
{
    [Route("/map")]
    [ApiController]
    public class MapController : Controller
    {
        private readonly IDynamoDb _dynamoDb;
        private readonly IWebHostEnvironment _env;

        public MapController(IDynamoDb dynamoDb, IWebHostEnvironment env)
        {
            _dynamoDb = dynamoDb;
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
            var area = await _dynamoDb.GetObject<Area>(name);

            return Ok(area);
        }

        [Route("export")]
        [HttpPost]      // POST /map/export
        public async Task<IActionResult> Export([FromBody] JsonElement formData)
        {
            Area area = null;
            Point point = null;

            string result = "";

            foreach (var jsonProperty in formData.EnumerateObject())
            {
                var propertyName = jsonProperty.Name;
                var propertyValue = jsonProperty.Value;

                if (propertyName == "area")
                {
                    area = new Area();
                    area.Name = propertyValue.GetProperty("name").ToString();
                    area.Coords = propertyValue.GetProperty("coords").Deserialize<double[][]>();
                }

                if (propertyName == "point")
                {
                    point = new Point();
                    point.Name = propertyValue.GetProperty("name").ToString();
                    point.Coords = propertyValue.GetProperty("coords").Deserialize<double[]>();
                }
            }

            if (area != null)
            {
                bool success = await _dynamoDb.PutObject<Area>(area);

                if (success)
                {
                    result += "Area was added\n";
                }
                else
                {
                    return BadRequest("Area with such name already exists.");
                }
            }

            if (point != null)
            {
                bool success = await _dynamoDb.PutObject<Point>(point);

                if (success)
                {
                    result += "Point was added\n";
                }
                else
                {
                    return BadRequest("Point with such name already exists.");
                }
            }

            return Ok(result);
        }

        [Route("import")]
        [HttpGet]   // GET /map/import
        public async Task<IActionResult> Import()
        {
            var allAreas = await _dynamoDb.GetAllObjects<Area>();
            var allPoints = await _dynamoDb.GetAllObjects<Point>();

            return Json(new {
                areas = allAreas,
                points = allPoints
            });
        }

        [Route("delete-feature")]
        [HttpPost]      // POST /map/import
        public async Task<IActionResult> DeleteFeature([FromBody] JsonElement data)
        {
            string result = "";

            var featureName = data.GetProperty("name").GetString();
            var featureType = data.GetProperty("objType").GetString();

            if (featureName != "")
            {
                if (featureType == "polygon")
                {
                    bool success = await _dynamoDb.DeleteObject<Area>(featureName);
                    if (success)
                    {
                        result = "Feature is deleted";
                        return Ok(result);
                    }
                    else
                    {
                        result = "Feature was not deleted";
                        return BadRequest(result);
                    }
                }
                else if (featureType == "point")
                {
                    bool success = await _dynamoDb.DeleteObject<Point>(featureName);
                    if (success)
                    {
                        result = "Feature is deleted";
                        return Ok(result);
                    }
                    else
                    {
                        result = "Feature was not deleted";
                        return BadRequest(result);
                    }
                }
                else
                {
                    return BadRequest("Wrong feature type");
                }
            }
            else
            {
                return BadRequest("There is no such feature in DB");
            }

        }

        [Route("build-trajectory")]
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
