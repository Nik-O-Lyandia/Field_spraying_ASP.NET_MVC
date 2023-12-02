using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_WorkPlan")]
    public class WorkPlan
    {
        [DynamoDBHashKey]
        public string Name { get; set; }

        [DynamoDBProperty]
        public string AreaName { get; set; }

        [DynamoDBProperty]
        public string PointName { get; set; }

        [DynamoDBProperty]
        public string TrajectoryName { get; set; }

        [DynamoDBProperty]
        public string DroneName { get; set; }

        [DynamoDBProperty]
        public float SpraySwathWidth { get; set; }

        [DynamoDBProperty]
        public float FlowRate { get; set; }

        [DynamoDBProperty]
        public float DroneSpeed { get; set; }

        public WorkPlan() { }

        public WorkPlan(string name, string areaName, string pointName, string trajectoryName, string droneName, float spraySwathWidth, float flowRate, float droneSpeed)
        {
            Name = name;
            AreaName = areaName;
            PointName = pointName;
            TrajectoryName = trajectoryName;
            DroneName = droneName;
            SpraySwathWidth = spraySwathWidth;
            FlowRate = flowRate;
            DroneSpeed = droneSpeed;
        }
    }
}
