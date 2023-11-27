using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_DroneType")]
    public class DroneType
    {
        [DynamoDBHashKey]
        public string? Name { get; set; }

        [DynamoDBProperty]
        public float? TankVolume { get; set; }

        [DynamoDBProperty]
        public float? SpraySwathWidthMin { get; set; }

        [DynamoDBProperty]
        public float? SpraySwathWidthMax { get; set; }

        [DynamoDBProperty]
        public float? FlowRateMin { get; set; }

        [DynamoDBProperty]
        public float? FlowRateMax { get; set; }

        [DynamoDBProperty]
        public int? MaxSpeed { get; set; }

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
