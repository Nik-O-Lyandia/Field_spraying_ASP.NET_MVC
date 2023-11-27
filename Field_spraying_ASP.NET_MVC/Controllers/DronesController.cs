using Amazon.DynamoDBv2.DataModel;
using DynamoDb.Libs.DynamoDb;
using Field_spraying_ASP.NET_MVC.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections;
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

        [Route("get-drone-type/{name}")]
        [HttpGet]
        public async Task<IActionResult> GetDroneType(string name)
        {
            var droneType = await _dynamoDb.GetObject<DroneType>(name);

            if (droneType == null)
                return BadRequest("No drone type with such name");

            return Ok(droneType);
        }

        [Route("get-all-drone-types")]
        [HttpGet]
        public async Task<IActionResult> GetAllDroneTypes()
        {
            var allDroneTypes = await _dynamoDb.GetAllObjects<DroneType>();

            if (allDroneTypes == null)
                return BadRequest("No drone types in DB");

            return Json(new
            {
                drones = allDroneTypes
            });
        }

        [Route("add-drone-type")]
        [HttpPost]   // drones/add-drone-type
        public async Task<IActionResult> AddDroneType([FromBody] JsonElement formData)
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
                DroneType droneType = new DroneType(
                    name: name,
                    tankVolume: tankVolume,
                    spraySwathWidthMin: spraySwathWidthMin,
                    spraySwathWidthMax: spraySwathWidthMax,
                    flowRateMin: flowRateMin,
                    flowRateMax: flowRateMax,
                    maxSpeed: maxSpeed);

                bool success = await _dynamoDb.PutObject<DroneType>(droneType);

                if (success)
                {
                    return Ok("Drone type was added");
                }
                else
                {
                    return BadRequest("Drone type with such name already exists");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [Route("delete-drone-type")]
        [HttpDelete]   // drones/delete-drone-type
        public async Task<IActionResult> DeleteDroneType([FromBody] JsonElement formData)
        {
            var name = formData.GetProperty("drone-type-name").ToString();

            var success = await _dynamoDb.DeleteObject<DroneType>(name);

            if (success)
            {
                return Ok("Drone type was deleted");
            }
            else
            {
                return BadRequest("No drone type with such name to delete");
            }
        }

        [Route("update-drone-type")]
        [HttpPut]   // drones/update-drone-type
        public async Task<IActionResult> UpdateDroneType([FromBody] JsonElement formData)
        {
            string name = formData.GetProperty("drone-type-name").ToString();
            string? newName = formData.GetProperty("new-drone-type-name").ToString() != "" ?
                formData.GetProperty("new-drone-type-name").ToString() :
                null;
            float? newTankVolume = formData.GetProperty("new-drone-tank-volume").ToString() != "" ?
                float.Parse(formData.GetProperty("new-drone-tank-volume").ToString().Replace(",", "."), CultureInfo.InvariantCulture) :
                null;
            float? newSpraySwathWidthMin = formData.GetProperty("new-drone-spray-swath-width-min").ToString() != "" ?
                float.Parse(formData.GetProperty("new-drone-spray-swath-width-min").ToString().Replace(",", "."), CultureInfo.InvariantCulture) :
                null;
            float? newSpraySwathWidthMax = formData.GetProperty("new-drone-spray-swath-width-max").ToString() != "" ?
                float.Parse(formData.GetProperty("new-drone-spray-swath-width-max").ToString().Replace(",", "."), CultureInfo.InvariantCulture) :
                null;
            float? newFlowRateMin = formData.GetProperty("new-drone-flow-rate-min").ToString() != "" ?
                float.Parse(formData.GetProperty("new-drone-flow-rate-min").ToString().Replace(",", "."), CultureInfo.InvariantCulture) :
                null;
            float? newFlowRateMax = formData.GetProperty("new-drone-flow-rate-max").ToString() != "" ?
                float.Parse(formData.GetProperty("new-drone-flow-rate-max").ToString().Replace(",", "."), CultureInfo.InvariantCulture) :
                null;
            int? newMaxSpeed = formData.GetProperty("new-drone-speed-max").ToString() != "" ?
                int.Parse(formData.GetProperty("new-drone-speed-max").ToString()) :
                null;

            DroneType newDroneType = new DroneType(
                    name: newName,
                    tankVolume: newTankVolume,
                    spraySwathWidthMin: newSpraySwathWidthMin,
                    spraySwathWidthMax: newSpraySwathWidthMax,
                    flowRateMin: newFlowRateMin,
                    flowRateMax: newFlowRateMax,
                    maxSpeed: newMaxSpeed);

            bool success = await _dynamoDb.UpdateObject<DroneType>(name, newDroneType);

            if (success)
            {
                return Ok("Drone type info was successfully updated");
            }
            else
            {
                return BadRequest("Drone type info wasn't updated due to some reasons");
            }
        }

        [Route("get-drone/{name}")]
        [HttpGet]   // drones/get-drone/{name}
        public async Task<IActionResult> GetDrone(string name)
        {
            var drone = await _dynamoDb.GetObject<Drone>(name);

            if (drone == null)
                return BadRequest("No drone with such name");

            return Ok(drone);
        }

        [Route("get-all-drones")]
        [HttpGet]   // drones/get-all-drones
        public async Task<IActionResult> GetAllDrones()
        {
            var allDrone = await _dynamoDb.GetAllObjects<Drone>();

            if (allDrone == null)
                return BadRequest("No drones in DB");

            return Json(new
            {
                drones = allDrone
            });
        }

        [Route("add-drone")]
        [HttpPost]   // drones/add-drone
        public async Task<IActionResult> AddDrone([FromBody] JsonElement formData)
        {
            var name = formData.GetProperty("drone-name").ToString();
            var typeName = formData.GetProperty("drone-type-name").ToString();

            try
            {
                Drone drone = new Drone(
                    name: name,
                    typeName: typeName);

                bool success = await _dynamoDb.PutObject<Drone>(drone);

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

        [Route("delete-drone")]
        [HttpDelete]   // drones/delete-drone
        public async Task<IActionResult> DeleteDrone([FromBody] JsonElement formData)
        {
            var name = formData.GetProperty("drone-name").ToString();

            var deleted = await _dynamoDb.DeleteObject<Drone>(name);

            if (deleted)
            {
                return Ok("Drone was deleted");
            }
            else
            {
                return BadRequest("No drone with such name to delete");
            }
        }

        [Route("update-drone")]
        [HttpPut]   // drones/update-drone
        public async Task<IActionResult> UpdateDrone([FromBody] JsonElement formData)
        {
            string name = formData.GetProperty("drone-name").ToString();
            string? newName = formData.GetProperty("new-drone-type-name").ToString() != "" ?
                formData.GetProperty("new-drone-type-name").ToString() :
                null;
            string? newTypeName = formData.GetProperty("new-drone-type-name").ToString() != "" ?
                formData.GetProperty("new-drone-type-name").ToString() :
                null;

            Drone newDrone = new Drone(
                    name: newName,
                    typeName: newTypeName);

            bool success = await _dynamoDb.UpdateObject<Drone>(name, newDrone);

            if (success)
            {
                return Ok("Drone info was updated");
            }
            else
            {
                return BadRequest("Drone info wasn't updated due to some reasons");
            }
        }

    }
}
