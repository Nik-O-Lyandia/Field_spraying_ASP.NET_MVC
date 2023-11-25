using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DynamoDb.Libs.DynamoDb
{
    public interface IDynamoDb
    {
        public void CreateTables();
        public Task<List<T>?> GetAllObjects<T>();
        public Task<T?> GetObject<T>(string elemName);
        public Task<bool> PutObject<T>(T obj) where T : class;
        public Task<bool> DeleteObject<T>(string elemName);
    }
}
