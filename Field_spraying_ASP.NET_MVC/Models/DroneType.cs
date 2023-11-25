using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_DroneType")]
    public class DroneType
    {
        [DynamoDBHashKey]
        public string? Name { get; set; }

        [DynamoDBProperty]
        private float? TankVolume { get; set; }

        [DynamoDBProperty]
        private float? SpraySwathWidthMin { get; set; }

        [DynamoDBProperty]
        private float? SpraySwathWidthMax { get; set; }

        [DynamoDBProperty]
        private float? FlowRateMin { get; set; }

        [DynamoDBProperty]
        private float? FlowRateMax { get; set; }

        [DynamoDBProperty]
        private int? MaxSpeed { get; set; }

        public DroneType() { }

        public DroneType(string? name, float? tankVolume, float? spraySwathWidthMin, float? spraySwathWidthMax, float? flowRateMin, float? flowRateMax, int? maxSpeed)
        {
            Name = name;
            TankVolume = tankVolume;
            SpraySwathWidthMin = spraySwathWidthMin;
            SpraySwathWidthMax = spraySwathWidthMax;
            FlowRateMin = flowRateMin;
            FlowRateMax = flowRateMax;
            MaxSpeed = maxSpeed;
        }
    }
}
