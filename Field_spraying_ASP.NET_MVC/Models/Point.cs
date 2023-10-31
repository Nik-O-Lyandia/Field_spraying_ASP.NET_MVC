using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_Point")]
    public class Point
    {
        [DynamoDBHashKey]
        public string Name { get; set; }

        [DynamoDBProperty]
        public double[][] Coords { get; set; }
    }
}
