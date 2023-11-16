using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_Drone")]
    public class Drone
    {
        [DynamoDBHashKey]
        string Name { get; set; }

        [DynamoDBProperty]
        string Type { get; set; }

        [DynamoDBProperty]
        float TankVolume { get; set; }

        [DynamoDBProperty]
        float SpraySwathWidthMin { get; set; }

        [DynamoDBProperty]
        float SpraySwathWidthMax { get; set; }

        [DynamoDBProperty]
        float MinFlow { get; set; }

        [DynamoDBProperty]
        float MaxFlow { get; set; }

        [DynamoDBProperty]
        int DropletSizeMin { get; set; }

        [DynamoDBProperty]
        int DropletSizeMax { get; set; }

        [DynamoDBProperty]
        int MaxSpeed { get; set; }
    }
}
