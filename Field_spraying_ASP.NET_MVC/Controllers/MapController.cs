using Amazon.DynamoDBv2.DataModel;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

using Field_spraying_ASP.NET_MVC.Models;
using System.Diagnostics;
using System.Globalization;
using System.Net;
using Amazon.DynamoDBv2;
using DynamoDb.Libs.DynamoDb;
using System.Xml.Linq;
using Field_spraying_ASP.NET_MVC.Services;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Field_spraying_ASP.NET_MVC.Controllers
{
    [Route("/map")]
    [ApiController]
    public class MapController : Controller
    {
        private readonly IDynamoDb _dynamoDb;
        private readonly IWebHostEnvironment _env;
        private readonly IDroneControlService _droneControlService;

        public MapController(IDynamoDb dynamoDb, IWebHostEnvironment env, IDroneControlService droneControlService)
        {
            _dynamoDb = dynamoDb;
            _env = env;
            _droneControlService = droneControlService;
        }

        [HttpGet]
        public IActionResult MapView()
        {
            return View();
        }

        [Route("get/{name}")]
        [HttpGet]
        public async Task<IActionResult> Get(string name)
        {
            var area = await _dynamoDb.GetObject<Area>(name);

            return Ok(area);
        }

        [Route("export")]
        [HttpPost]
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
        [HttpGet]
        public async Task<IActionResult> Import()
        {
            var allAreas = await _dynamoDb.GetAllObjects<Area>();
            var allPoints = await _dynamoDb.GetAllObjects<Point>();

            return Json(new
            {
                areas = allAreas,
                points = allPoints
            });
        }

        [Route("delete-feature")]
        [HttpPost]
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

        [Route("get-all-work-plans")]
        [HttpGet]
        public async Task<IActionResult> GetAllWorkPlans()
        {
            var allWorkPlans = await _dynamoDb.GetAllObjects<WorkPlan>();

            return Json(new
            {
                workPlans = allWorkPlans
            });
        }

        [Route("add-work-plan")]
        [HttpPost]
        public async Task<IActionResult> AddWorkPlan([FromBody] JsonElement formData)
        {
            var workPlanName = formData.GetProperty("work-plan-name").ToString();
            var areaName = formData.GetProperty("area-name").ToString();
            var pointName = formData.GetProperty("point-name").ToString();
            var droneName = formData.GetProperty("drone-name").ToString();
            var sprayingSwathWidth = float.Parse(formData.GetProperty("spraying-swath-width").ToString().Replace(",", "."), CultureInfo.InvariantCulture);
            var flowRate = float.Parse(formData.GetProperty("flow-rate").ToString().Replace(",", "."), CultureInfo.InvariantCulture);
            var droneSpeed = float.Parse(formData.GetProperty("drone-speed").ToString().Replace(",", "."), CultureInfo.InvariantCulture);

            string contentRootPath = _env.ContentRootPath;
            string cppFilePath = contentRootPath + @"\python_algorithms\main.py";
            double[][] routeArray = new double[0][];

            try
            {
                CoverageTrajectory trajectory = new CoverageTrajectory() { Name = workPlanName + "-" + areaName + "-" + pointName, AreaName = areaName, PointName = pointName, Coords = routeArray };

                CoverageTrajectory? trajectoryFromDb = await _dynamoDb.GetObject<CoverageTrajectory>(trajectory.Name);

                if (trajectoryFromDb == null)
                {
                    CmdRun cmdRun = new CmdRun();
                    string arguments = "-a " + areaName + " -p " + pointName + " -r " + (sprayingSwathWidth / 2.0).ToString().Replace(",", ".");
                    var route = cmdRun.RunPython(cppFilePath, arguments);

                    //Debug.WriteLine(route);
                    var routeCoords = route.Split(",");
                    routeArray = new double[routeCoords.Length / 2][];

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

                    if (!routeArray.Any()) return BadRequest("No route was added to coverage trajectory");

                    trajectory.Coords = routeArray;

                    bool trajectoryPutSuccess = await _dynamoDb.PutObject<CoverageTrajectory>(trajectory);

                    if (trajectoryPutSuccess)
                    {
                        WorkPlan workPlan = new WorkPlan(
                            name: workPlanName,
                            areaName: areaName,
                            trajectoryName: trajectory.Name,
                            pointName: pointName,
                            droneName: droneName,
                            spraySwathWidth: sprayingSwathWidth,
                            flowRate: flowRate,
                            droneSpeed: droneSpeed);

                        bool workPlanPutSuccess = await _dynamoDb.PutObject<WorkPlan>(workPlan);

                        if (!workPlanPutSuccess)
                        {
                            return BadRequest("Work Plan with such name already exists");
                        }
                        return Ok(trajectory);
                    }
                    else
                    {
                        return BadRequest("Coverage trajectory wasn't added");
                    }
                }
                else
                {
                    return BadRequest("Coverage trajectory already exists");
                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("update-work-plan")]
        [HttpPut]
        public async Task<IActionResult> UpdateWorkPlan([FromBody] JsonElement formData)
        {
            var workPlanName = formData.GetProperty("work-plan-name").ToString();
            var newWorkPlanName = formData.GetProperty("new-work-plan-name").ToString() != "" ?
                formData.GetProperty("new-work-plan-name").ToString() :
                null;
            var areaName = formData.GetProperty("area-name").ToString() != "" ?
                formData.GetProperty("area-name").ToString() :
                null;
            var pointName = formData.GetProperty("point-name").ToString() != "" ?
                formData.GetProperty("point-name").ToString() :
                null;
            var droneName = formData.GetProperty("drone-name").ToString() != "None" ?
                formData.GetProperty("drone-name").ToString() :
                null;
            float? sprayingSwathWidth = formData.GetProperty("spraying-swath-width").ToString() != "" ? 
                float.Parse(formData.GetProperty("spraying-swath-width").ToString().Replace(",", "."), CultureInfo.InvariantCulture) :
                null;
            float? flowRate = formData.GetProperty("flow-rate").ToString() != "" ?
                float.Parse(formData.GetProperty("flow-rate").ToString().Replace(",", "."), CultureInfo.InvariantCulture) :
                null;
            float? droneSpeed = formData.GetProperty("drone-speed").ToString() != "" ?
                float.Parse(formData.GetProperty("drone-speed").ToString().Replace(",", "."), CultureInfo.InvariantCulture) :
                null;

            string contentRootPath = _env.ContentRootPath;
            string cppFilePath = contentRootPath + @"\python_algorithms\main.py";
            double[][] routeArray = new double[0][];

            CoverageTrajectory trajectory = new CoverageTrajectory() { Name = workPlanName + "-" + areaName + "-" + pointName, AreaName = areaName, PointName = pointName, Coords = routeArray };

            CoverageTrajectory? trajectoryFromDb = await _dynamoDb.GetObject<CoverageTrajectory>(trajectory.Name);

            WorkPlan workPlan = new WorkPlan(
                name: newWorkPlanName,
                areaName: areaName,
                trajectoryName: null,
                pointName: pointName,
                droneName: droneName,
                spraySwathWidth: sprayingSwathWidth,
                flowRate: flowRate,
                droneSpeed: droneSpeed);

            var success = await _dynamoDb.GetObject<WorkPlan>(workPlanName);

            if (trajectoryFromDb != null)
            {
                if (trajectoryFromDb.AreaName != areaName || trajectoryFromDb.PointName != pointName)
                {
                    CmdRun cmdRun = new CmdRun();
                    string arguments = "-a " + areaName + " -p " + pointName + " -r " + (sprayingSwathWidth / 2.0).ToString().Replace(",", ".");
                    var route = cmdRun.RunPython(cppFilePath, arguments);

                    //Debug.WriteLine(route);
                    var routeCoords = route.Split(",");
                    routeArray = new double[routeCoords.Length / 2][];

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

                    if (!routeArray.Any()) return BadRequest("No route was added to coverage trajectory");

                    trajectory.Coords = routeArray;

                    bool trajectoryPutSuccess = await _dynamoDb.PutObject<CoverageTrajectory>(trajectory);

                    if (trajectoryPutSuccess)
                    {
                        workPlan.TrajectoryName = trajectory.Name;
                    }
                    else
                    {
                        return BadRequest("Coverage trajectory wasn't added");
                    }
                }
            }

            bool updateSuccess = await _dynamoDb.UpdateObject<WorkPlan>(workPlanName, workPlan);

            if (updateSuccess)
            {
                return Ok("Work plan was updated");
            }
            else
            {
                return BadRequest("No work plan with such name was found");
            }

        }

        [Route("delete-work-plan")]
        [HttpDelete]
        public async Task<IActionResult> DeleteWorkPlan([FromBody] JsonElement formData)
        {
            try
            {
                var workPlanName = formData.GetProperty("work-plan").ToString();

                var workPlan = await _dynamoDb.GetObject<WorkPlan>(workPlanName);

                var trajectorySuccess = await _dynamoDb.DeleteObject<CoverageTrajectory>(workPlan.TrajectoryName);
                var workPlanSuccess = await _dynamoDb.DeleteObject<WorkPlan>(workPlanName);

                if (workPlanSuccess && trajectorySuccess)
                {
                    return Ok("Work plan was deleted");
                }
                else
                {
                    return BadRequest("No work plan with such name to delete");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return BadRequest(ex.Message);
            }
        }

        [Route("start-work-plan")]
        [HttpPost]
        public async Task<IActionResult> StartWorkPlan([FromBody] JsonElement formData)
        {
            var workPlanName = formData.GetProperty("work-plan-name").ToString();

            var workPlan = await _dynamoDb.GetObject<WorkPlan>(workPlanName);

            if (workPlan == null) return BadRequest("No such work plan in DB");

            try
            {
                _droneControlService.InitWorkPlanSimulation(workPlan);
                return Ok("Work plan has been started.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("get-work-plan-status/{workPlanName}")]
        [HttpGet]
        public IActionResult GetWorkPlanStatus(string workPlanName)
        {
            try
            {
                var dronePosition = _droneControlService.GetCurrentDronePosition(workPlanName);
                if (dronePosition[0] == -1 && dronePosition[1] == -1)
                {
                    return Ok(false);
                }
                return Ok(dronePosition);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("stop-work-plan")]
        [HttpPost]
        public async Task<IActionResult> StopWorkPlan([FromBody] JsonElement formData)
        {
            var workPlanName = formData.GetProperty("work-plan-name").ToString();

            //var workPlan = await _dynamoDb.GetObject<WorkPlan>(workPlanName);

            try
            {
                 _droneControlService.StopWorkPlanSimulation(workPlanName);
                return Ok("Work plan was stopped");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("get-work-plan-trajectory/{workPlanName}")]
        [HttpGet]
        public async Task<IActionResult> GetWorkPlanTrajectory(string workPlanName)
        {
            try
            {
                var workPlan = await _dynamoDb.GetObject<WorkPlan>(workPlanName);
                var trajectory = await _dynamoDb.GetObject<CoverageTrajectory>(workPlan.TrajectoryName);
                if (trajectory != null)
                {
                    return Ok(trajectory);
                } 
                else
                {
                    return BadRequest("No trajectory with such name in DB");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("get-test")]
        [HttpGet]
        public IActionResult GetTest()
        {
            return Ok(false);
        }
    }
}
