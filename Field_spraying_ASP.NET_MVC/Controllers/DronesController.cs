using Amazon.DynamoDBv2.DataModel;
using DynamoDb.Libs.DynamoDb;
using Field_spraying_ASP.NET_MVC.Models;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Text.Json;
using System.Xml.Linq;

namespace Field_spraying_ASP.NET_MVC.Controllers
{
    [Route("/drones")]
    [ApiController]
    public class DronesController : Controller
    {
        private readonly IWebHostEnvironment _env;
        private readonly IDynamoDb _dynamoDb;

        public DronesController(IWebHostEnvironment env, IDynamoDb dynamoDb)
        {
            _env = env;
            _dynamoDb = dynamoDb;
        }

        [HttpGet]
        public IActionResult DronesView()
        {
            return View();
        }

        [Route("get/{name}")]
        [HttpGet]   // GET /map/get/{name}
        public async Task<IActionResult> GetDrone(string name)
        {
            var drone = await _dynamoDb.GetObject<DroneType>(name);

            if (drone == null)
                return BadRequest("No drone with such name");

            return Ok(drone);
        }

        [Route("get-all")]
        [HttpGet]   // GET /map/get/{name}
        public async Task<IActionResult> GetAllDrones()
        {
            var allDrones = await _dynamoDb.GetAllObjects<DroneType>();

            if (allDrones == null)
                return BadRequest("No drones in DB");

            return Json(new
            {
                drones = allDrones
            });
        }

        [Route("add-drone-type")]
        [HttpPost]   // GET /drones/add-drone-type
        public async Task<IActionResult> AddNewDrone([FromBody] JsonElement formData)
        {
            var name = formData.GetProperty("drone-type-name").ToString();
            var tankVolume = float.Parse(formData.GetProperty("drone-tank-volume").ToString().Replace(",", "."), CultureInfo.InvariantCulture);
            var spraySwathWidthMin = float.Parse(formData.GetProperty("drone-spray-swath-width-min").ToString().Replace(",", "."), CultureInfo.InvariantCulture);
            var spraySwathWidthMax = float.Parse(formData.GetProperty("drone-spray-swath-width-max").ToString().Replace(",", "."), CultureInfo.InvariantCulture);
            var flowRateMin = float.Parse(formData.GetProperty("drone-flow-rate-min").ToString().Replace(",", "."), CultureInfo.InvariantCulture);
            var flowRateMax = float.Parse(formData.GetProperty("drone-flow-rate-max").ToString().Replace(",", "."), CultureInfo.InvariantCulture);
            var maxSpeed = int.Parse(formData.GetProperty("drone-speed-max").ToString());
            try
            {
                DroneType drone = new DroneType(
                    name: formData.GetProperty("drone-type-name").ToString(),
                    tankVolume: float.Parse(formData.GetProperty("drone-tank-volume").ToString().Replace(",", "."), CultureInfo.InvariantCulture),
                    spraySwathWidthMin: float.Parse(formData.GetProperty("drone-spray-swath-width-min").ToString().Replace(",","."), CultureInfo.InvariantCulture),
                    spraySwathWidthMax: float.Parse(formData.GetProperty("drone-spray-swath-width-max").ToString().Replace(",", "."), CultureInfo.InvariantCulture),
                    flowRateMin: float.Parse(formData.GetProperty("drone-flow-rate-min").ToString().Replace(",", "."), CultureInfo.InvariantCulture),
                    flowRateMax: float.Parse(formData.GetProperty("drone-flow-rate-max").ToString().Replace(",", "."), CultureInfo.InvariantCulture),
                    maxSpeed: int.Parse(formData.GetProperty("drone-speed-max").ToString()));

                bool success = await _dynamoDb.PutObject<DroneType>(drone);

                if (success)
                {
                    return Ok("Drone was added");
                }
                else
                {
                    return BadRequest("Drone with such name already exists");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }


        [Route("delete/{name}")]
        [HttpGet]   // GET /map/get/{name}
        public async Task<IActionResult> DeleteDrone(string name)
        {
            bool success = await _dynamoDb.DeleteObject<DroneType>(name);
            if (success)
            {
                return Ok("Drone was deleted");
            }
            else
            {
                return BadRequest("No drone with such name in DB");
            }
        }
    }
}
