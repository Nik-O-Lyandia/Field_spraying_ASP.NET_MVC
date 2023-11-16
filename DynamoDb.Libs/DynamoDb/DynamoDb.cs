using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace DynamoDb.Libs.DynamoDb
{
    public class DynamoDb : IDynamoDb
    {
        private readonly IAmazonDynamoDB _dynamoDbClient;
        private readonly IDynamoDBContext _dynamoDBContext;

        public DynamoDb(IAmazonDynamoDB dynamoDbClient, IDynamoDBContext dynamoDBContext)
        {
            _dynamoDbClient = dynamoDbClient;
            _dynamoDBContext = dynamoDBContext;
        }

        public void CreateTables()
        {
            try
            {
                CreateTempTable("dplm_Area");
                CreateTempTable("dplm_Point");
                CreateTempTable("dplm_Drone");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw;
            }
        }

        public async Task<List<T>?> GetAllObjects<T>()
        {
            var conditions = new List<ScanCondition>();
            try
            {
                return await _dynamoDBContext.ScanAsync<T>(conditions).GetRemainingAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return null;
            }
        }

        public async Task<T?> GetObject<T>(string elemName)
        {
            try
            {
                return await _dynamoDBContext.LoadAsync<T>(elemName);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return default(T);
            }
        }

        public async Task<bool> PutObject<T>(T obj)
        {
            Type t = obj.GetType();
            PropertyInfo prop = t.GetProperty("Name");
            object name = prop.GetValue(obj);

            List<ScanCondition> conditions = new List<ScanCondition>();
            conditions.Add(new ScanCondition("Name", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, name));
            var search = _dynamoDBContext.ScanAsync<T>(conditions);
            var objects = await search.GetNextSetAsync().ConfigureAwait(false);

            if (objects.Count == 0 || objects == null)
            {
                try
                {
                    await _dynamoDBContext.SaveAsync(obj);
                    return true;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                    return false;
                }
            }
            else
            {
                Console.WriteLine("Object already exists in DB");
                return false;
            }
        }

        public async Task<bool> DeleteObject<T>(string elemName)
        {
            try
            {
                await _dynamoDBContext.DeleteAsync<T>(elemName);
                var resultObj = await _dynamoDBContext.LoadAsync<T>(elemName);

                if (resultObj == null)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return false;
            }
        }

        private void CreateTempTable(string tableName)
        {
            Console.WriteLine("Getting list of tables");

            var currentTables = _dynamoDbClient.ListTablesAsync().Result.TableNames;

            if (!currentTables.Contains(tableName))
            {
                var request = new CreateTableRequest
                {
                    TableName = tableName,
                    AttributeDefinitions = new List<AttributeDefinition>
                    {
                        new AttributeDefinition
                        {
                            AttributeName = "Name",
                            // "S" = string, "N" = number, and so on.
                            AttributeType = "S"
                        }
                    },
                    KeySchema = new List<KeySchemaElement>
                    {
                        new KeySchemaElement
                        {
                            AttributeName = "Name",
                            // "HASH" = hash key, "RANGE" = range key.
                            KeyType = "HASH"
                        }
                    },
                    ProvisionedThroughput = new ProvisionedThroughput
                    {
                        ReadCapacityUnits = 5,
                        WriteCapacityUnits = 5
                    },
                };

                var response = _dynamoDbClient.CreateTableAsync(request).Result;

                Console.WriteLine("Table created with request Name: " +
                  response.ResponseMetadata.RequestId);
            }
        }

    }
}
