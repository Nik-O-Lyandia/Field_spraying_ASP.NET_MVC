using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_CoverageTrajectory")]
    public class CoverageTrajectory
    {
        [DynamoDBHashKey]
        public string Name { get; set; }

        [DynamoDBProperty]
        public string AreaName { get; set; }

        [DynamoDBProperty]
        public string PointName { get; set; }

        [DynamoDBProperty]
        public double[][] Coords { get; set; }

        public CoverageTrajectory() { }
    }
}
