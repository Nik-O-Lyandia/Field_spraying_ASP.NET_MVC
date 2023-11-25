using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_Drone")]
    public class Drone
    {
        [DynamoDBHashKey]
        public string Name { get; set; }

        [DynamoDBRangeKey]
        string TypeName { get; set; }

        public Drone() { }
    }
}
