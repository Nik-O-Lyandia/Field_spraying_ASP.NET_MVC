namespace Field_spraying_ASP.NET_MVC.Services
{
    public interface IPasswordHasherService
    {
        public string GenerateHash(string password, string salt, string pepper, int iteration);
        public string GenerateSalt();
    }
}