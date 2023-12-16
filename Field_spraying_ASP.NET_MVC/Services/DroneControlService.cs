using Amazon.DynamoDBv2;
using DynamoDb.Libs.DynamoDb;
using Field_spraying_ASP.NET_MVC.Models;
using NuGet.Packaging.Signing;
using System;
using System.Diagnostics;
using System.Security.Cryptography.Xml;

namespace Field_spraying_ASP.NET_MVC.Services
{
    public class DroneControlService : IDroneControlService
    {
        private readonly IDynamoDb _dynamoDb;
        private List<DroneControl> _droneControls;

        public DroneControlService(IDynamoDb dynamoDb)
        {
            _dynamoDb = dynamoDb;
            _droneControls = new List<DroneControl>();
        }

        public void InitWorkPlanSimulation(WorkPlan workPlan)
        {
            var trajectory = _dynamoDb.GetObject<CoverageTrajectory>(workPlan.TrajectoryName).Result;
            var loadingPoint = _dynamoDb.GetObject<Point>(workPlan.PointName).Result;
            Drone drone = _dynamoDb.GetObject<Drone>(workPlan.DroneName).Result;
            DroneType droneType = _dynamoDb.GetObject<DroneType>(drone.DroneType).Result;
            var currentDronePosition = (double[])loadingPoint.Coords.Clone(); //loadingPoint // trajectory.Coords[55]
            var currentDroneTankVolume = droneType.TankVolume ?? 0;

            DroneControl droneControl = new DroneControl(
                workPlanName: workPlan.Name,
                trajectory: trajectory,
                loadingPoint: loadingPoint,
                drone: drone,
                droneType: droneType,
                lastTrajectoryPointVisitedIndex: -1, // -1
                currentDronePosition: currentDronePosition,
                currentDroneTankVolume: currentDroneTankVolume,
                currentDroneSpeed: 0,
                lastCallTime: DateTime.Now
                );

            Debug.WriteLine(format: "Loading Point: [{0}]", string.Join(", ", loadingPoint.Coords));
            Debug.WriteLine(format: "Trajectory[0]: [{0}]", string.Join(", ", trajectory.Coords[0]));

            _droneControls.Add(droneControl);
        }

        public void StopWorkPlanSimulation(string workPlanName)
        {
            bool workPlanIsRunning = _droneControls.Any(c => c.WorkPlanName == workPlanName);
            var control = _droneControls.First(c => c.WorkPlanName == workPlanName);

            if (workPlanIsRunning)
            {
                _droneControls.Remove(control);
            }
        }

        public double[] GetCurrentDronePosition(string workPlanName)
        {
            Debug.WriteLine("-----------");
            DroneControl control = _droneControls.First((c) => { return c.WorkPlanName == workPlanName; });

            // Calculating time between method calls
            TimeSpan t = DateTime.Now - control.LastCallTime;
            control.LastCallTime = DateTime.Now;

            int lastIndex = control.LastTrajectoryPointVisitedIndex;
            double[] lastPoint = new double[0];
            double[] nextPoint = new double[0];
            double[] nextNextPoint = new double[0];
            double angleBetweenTwoSegments = 0;

            bool isLastSegment = false;

            Debug.WriteLine("Coords Length: \t" + control.Trajectory.Coords.Length.ToString());
            Debug.WriteLine("lastIndex: \t" + lastIndex.ToString());


            if (lastIndex == -1)
            {
                lastPoint = (double[])control.LoadingPoint.Coords.Clone();
                nextPoint = (double[])control.Trajectory.Coords[0].Clone();
                nextNextPoint = (double[])control.Trajectory.Coords[1].Clone();
            }
            else if (lastIndex + 1 == control.Trajectory.Coords.Length)
            {
                isLastSegment = true;
                lastPoint = (double[])control.Trajectory.Coords[0].Clone();
                nextPoint = (double[])control.LoadingPoint.Coords.Clone();
                nextNextPoint = (double[])control.Trajectory.Coords[1].Clone();
            }
            else
            {
                lastPoint = (double[])control.Trajectory.Coords[lastIndex].Clone();
                for (int i = lastIndex; i < control.Trajectory.Coords.Length; i++)
                {
                    var p1 = (double[])control.Trajectory.Coords[i].Clone();
                    nextPoint = i + 1 < control.Trajectory.Coords.Length ?
                        (double[])control.Trajectory.Coords[i + 1].Clone() :
                        (double[])control.Trajectory.Coords[0].Clone();
                    nextNextPoint = i + 2 < control.Trajectory.Coords.Length ?
                        (double[])control.Trajectory.Coords[i + 2].Clone() :
                        (double[])control.LoadingPoint.Coords.Clone();

                    double line_12 = Math.Pow((p1[0] - nextPoint[0]), 2) + Math.Pow((p1[1] - nextPoint[1]), 2);
                    double line_13 = Math.Pow((nextPoint[0] - nextNextPoint[0]), 2) + Math.Pow((nextPoint[1] - nextNextPoint[1]), 2);
                    double line_23 = Math.Pow((p1[0] - nextNextPoint[0]), 2) + Math.Pow((p1[1] - nextNextPoint[1]), 2);

                    angleBetweenTwoSegments = Math.Acos((line_12 + line_13 - line_23) / (2 * Math.Sqrt(line_12) * Math.Sqrt(line_13)));

                    angleBetweenTwoSegments = angleBetweenTwoSegments * 180 / Math.PI;

                    if (lastIndex == 27)
                    {
                        Debug.WriteLine("###########################################");
                        Debug.WriteLine(format: "\tindex: \t{0}", i);
                        Debug.WriteLine(format: "\tp1:\t({0},{1})", p1[0], p1[1]);
                        Debug.WriteLine(format: "\tp2:\t({0},{1})", nextPoint[0], nextPoint[1]);
                        Debug.WriteLine(format: "\tp3:\t({0},{1})", nextNextPoint[0], nextNextPoint[1]);
                        Debug.WriteLine("\tAngle: " + angleBetweenTwoSegments.ToString());
                    }
                    control.IndexIncrement = i + 1 - lastIndex;
                    if ((1 < angleBetweenTwoSegments && angleBetweenTwoSegments < 179) ||
                        (179 < angleBetweenTwoSegments && p1[0] == nextNextPoint[0] && p1[1] == nextNextPoint[1]) || 
                        (angleBetweenTwoSegments < 1 && p1[0] == nextNextPoint[0] && p1[1] == nextNextPoint[1]) ||
                        double.IsNaN(angleBetweenTwoSegments))
                    {
                        break;
                    }
                }
            }


            // Braking distance
            double brakingDistance = control.CurrentDroneSpeed * control.CurrentDroneSpeed / (2 * control.a);

            double distanceFromCurPosToNextPoint = Math.Sqrt(Math.Pow((nextPoint[0] - control.CurrentDronePosition[0]), 2) + Math.Pow((nextPoint[1] - control.CurrentDronePosition[1]), 2));

            if (distanceFromCurPosToNextPoint <= brakingDistance && !control.nowBraking)
            {
                control.a = 0 - control.a;
                control.nowBraking = true;
            }

            // Calculating drone move direction
            double[] trajectoryVector = new double[] { (nextPoint[0] - control.CurrentDronePosition[0]), (nextPoint[1] - control.CurrentDronePosition[1]) };
            double[] xVector = new double[] { 1, 0 };

            double directionAngle = Math.Atan2(trajectoryVector[1], trajectoryVector[0]) - Math.Atan2(xVector[1], xVector[0]);

            // Drone speed increment
            control.CurrentDroneSpeed = control.CurrentDroneSpeed + control.a * t.TotalSeconds;

            if (control.CurrentDroneSpeed > control.DroneType.MaxSpeed)
            {
                control.CurrentDroneSpeed = (double)control.DroneType.MaxSpeed;
            }
            else if (control.CurrentDroneSpeed < 0 && angleBetweenTwoSegments > 91)
            {
                control.CurrentDroneSpeed = (double)control.DroneType.MaxSpeed / 3.0;
            }
            else if (control.CurrentDroneSpeed < 0)
            {
                control.CurrentDroneSpeed = 0.1;
            }

            // Calculating new drone position according to its last current speed and time passed between method calls
            control.CurrentDronePosition[0] = control.CurrentDronePosition[0] + control.CurrentDroneSpeed * Math.Cos(directionAngle) * t.TotalSeconds;
            control.CurrentDronePosition[1] = control.CurrentDronePosition[1] + control.CurrentDroneSpeed * Math.Sin(directionAngle) * t.TotalSeconds;


            double x1 = lastPoint[0];
            double y1 = lastPoint[1];
            double x2 = nextPoint[0];
            double y2 = nextPoint[1];

            double x = control.CurrentDronePosition[0];
            double y = control.CurrentDronePosition[1];

            if(Math.Abs(x-x2) < 0.1 && Math.Abs(y - y2) < 0.1)
            {
                if (isLastSegment)
                {
                    return new double[] { -1, -1 };
                }
                control.LastTrajectoryPointVisitedIndex = control.LastTrajectoryPointVisitedIndex + control.IndexIncrement;
                control.nowBraking = false;
                control.a = 0 - control.a;
            }

            return control.CurrentDronePosition;
        }
    }
}
