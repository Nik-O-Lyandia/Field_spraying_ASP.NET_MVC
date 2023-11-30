using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DynamoDb.Libs.DynamoDb
{
    public interface IDynamoDb
    {
        public void CreateTables();
        public Task<List<T>?> GetAllObjects<T>() where T : class;
        public Task<T?> GetObject<T>(string elemName) where T : class;
        public Task<T?> GetObject<T>(string hashKey, string rangeKey) where T : class;
        public Task<bool> PutObject<T>(T obj) where T : class;
        public Task<bool> DeleteObject<T>(string elemName) where T : class;
        public Task<bool> DeleteObject<T>(string hashKey, string rangeKey) where T : class;
        public Task<bool> UpdateObject<T>(string elemName, T updatedObj) where T : class;
        public Task<bool> UpdateObject<T>(string hashKey, string rangeKey, T updatedObj) where T : class;
    }
}
