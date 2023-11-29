using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_Drone")]
    public class Drone
    {
        [DynamoDBHashKey]
        public string? Name { get; set; }

        [DynamoDBProperty]
        public string? DroneType { get; set; }

        public Drone() { }

        public Drone(string? name, string? droneType)
        {
            Name = name;
            DroneType = droneType;
        }
    }
}
