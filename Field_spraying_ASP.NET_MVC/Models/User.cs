using Amazon.DynamoDBv2.DataModel;

namespace Field_spraying_ASP.NET_MVC.Models
{
    [DynamoDBTable("dplm_User")]
    public class User
    {
        [DynamoDBHashKey]
        public string Username { get; set; }

        [DynamoDBProperty]
        public string PasswordSalt { get; set; }

        [DynamoDBProperty]
        public string PasswordHash { get; set; }

    }
}
