using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_Drone")]
    public class Drone
    {
        [DynamoDBHashKey]
        public string? Name { get; set; }

        [DynamoDBRangeKey]
        private string? TypeName { get; set; }

        public Drone() { }

        public Drone(string? name, string? typeName)
        {
            Name = name;
            TypeName = typeName;
        }
    }
}
