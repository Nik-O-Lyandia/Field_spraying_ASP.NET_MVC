using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Security.AccessControl;
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
                CreateTempTable("dplm_Area", "Name");
                CreateTempTable("dplm_Point", "Name");
                CreateTempTable("dplm_DroneType", "Name");
                CreateTempTable("dplm_Drone", "Name", "DroneType");
            }
            catch (Exception ex)
            {
                // LOG HERE
                throw;
            }
        }

        /// <summary>
        /// Retrieves all object of specific class <typeparamref name="T"/>.
        /// </summary>
        public async Task<List<T>?> GetAllObjects<T>() where T : class
        {
            var conditions = new List<ScanCondition>();
            try
            {
                return await _dynamoDBContext.ScanAsync<T>(conditions).GetRemainingAsync();
            }
            catch (Exception ex)
            {
                // LOG HERE
                return null;
            }
        }

        /// <summary>
        /// Retrieves object specified by <paramref name="elemName"/> and class <typeparamref name="T"/>.
        /// </summary>
        public async Task<T?> GetObject<T>(string elemName) where T : class
        {
            try
            {
                return await _dynamoDBContext.LoadAsync<T>(elemName);
            }
            catch (Exception ex)
            {
                // LOG HERE
                return default(T);
            }
        }

        /// <summary>
        /// Puts new object <paramref name="obj"/> into DB.
        /// </summary>
        public async Task<bool> PutObject<T>(T obj) where T : class
        {
            Type objType = obj.GetType();
            PropertyInfo objNameProp = objType.GetProperty("Name");
            object objName = objNameProp.GetValue(obj);

            var loadedObject = this.GetObject<T>((string)objName);

            if (loadedObject.Result == null)
            {
                try
                {
                    await _dynamoDBContext.SaveAsync(obj);
                    return true;
                }
                catch (Exception ex)
                {
                    // LOG HERE
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// Deletes existing object specified by <paramref name="elemName"/> and class <typeparamref name="T"/>.
        /// </summary>
        public async Task<bool> DeleteObject<T>(string elemName) where T : class
        {
            try
            {
                await _dynamoDBContext.DeleteAsync<T>(elemName);
                var resultObj = await this.GetObject<T>(elemName);

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
                // LOG HERE
                return false;
            }
        }

        /// <summary>
        /// Updates existing object specified by <paramref name="elemName"/> with parameters from new <paramref name="updatedObj"/>.
        /// </summary>
        public async Task<bool> UpdateObject<T>(string elemName, T updatedObj) where T : class
        {
            var retrievedObj = await this.GetObject<T>(elemName);

            Type retrievedObjType = retrievedObj.GetType();
            PropertyInfo[] retrievedObjProps = retrievedObjType.GetProperties();

            Type updatedObjType = updatedObj.GetType();
            PropertyInfo[] updatedObjProps = updatedObjType.GetProperties();

            for (int i = 0; i < updatedObjProps.Length; i++)
            {
                if (updatedObjProps[i].GetValue(updatedObj) == null)
                {
                    updatedObjProps[i].SetValue(updatedObj, retrievedObjProps[i].GetValue(retrievedObj));
                }
            }

            if (retrievedObj != null)
            {
                try
                {
                    await _dynamoDBContext.SaveAsync(updatedObj);
                    return true;
                }
                catch (Exception ex)
                {
                    // LOG HERE
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// Creates a table with given <paramref name="tableName"/> and <paramref name="partitionKey"/>.
        /// </summary>
        private void CreateTempTable(string tableName, string partitionKey)
        {
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
                            AttributeName = partitionKey,
                            // "S" = string, "N" = number, and so on.
                            AttributeType = "S"
                        }
                    },
                    KeySchema = new List<KeySchemaElement>
                    {
                        new KeySchemaElement
                        {
                            AttributeName = partitionKey,
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

        /// <summary>
        /// Creates a table with given <paramref name="tableName"/> and composite primary key (specified by <paramref name="partitionKey"/> and <paramref name="sortKey"/>).
        /// </summary>
        private void CreateTempTable(string tableName, string partitionKey, string sortKey)
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
                            AttributeName = partitionKey,
                            // "S" = string, "N" = number, and so on.
                            AttributeType = "S"
                        },
                        new AttributeDefinition
                        {
                            AttributeName = sortKey,
                            AttributeType = "S"
                        },
                    },
                    KeySchema = new List<KeySchemaElement>
                    {
                        new KeySchemaElement
                        {
                            AttributeName = partitionKey,
                            // "HASH" = hash key, "RANGE" = range key.
                            KeyType = "HASH"
                        },
                        new KeySchemaElement
                        {
                            AttributeName = sortKey,
                            KeyType = "RANGE"
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

        /// <summary>
        /// Creates a table with given <paramref name="tableName"/>, composite primary key (specified by <paramref name="partitionKey"/> and <paramref name="sortKey"/>) and <paramref name="globalSecondaryIndexes"/> enumeration.
        /// </summary>
        private void CreateTempTable(string tableName, string partitionKey, string sortKey, List<string> globalSecondaryIndexes)
        {
            Console.WriteLine("Getting list of tables");

            var currentTables = _dynamoDbClient.ListTablesAsync().Result.TableNames;

            if (!currentTables.Contains(tableName))
            {
                // Attribute definitions
                var attributeDefinitions = new List<AttributeDefinition>
                {
                    new AttributeDefinition
                    {
                        AttributeName = partitionKey,
                        // "S" = string, "N" = number, and so on.
                        AttributeType = "S"
                    },
                    new AttributeDefinition
                    {
                        AttributeName = sortKey,
                        AttributeType = "S"
                    },
                };

                // Table key schema
                var tableKeySchema = new List<KeySchemaElement>
                {
                    new KeySchemaElement
                    {
                        AttributeName = partitionKey,
                        // "HASH" = hash key, "RANGE" = range key.
                        KeyType = "HASH"
                    },
                    new KeySchemaElement
                    {
                        AttributeName = sortKey,
                        KeyType = "RANGE"
                    }
                };

                // Indexes
                var indexes = new List<GlobalSecondaryIndex>();
                for (int i = 0; i < globalSecondaryIndexes.Count; i++)
                {
                    indexes.Add(new GlobalSecondaryIndex
                    {
                        IndexName = globalSecondaryIndexes[i],
                        KeySchema = new List<KeySchemaElement>
                        {
                            new KeySchemaElement { AttributeName = globalSecondaryIndexes[i], KeyType = "S" },
                            new KeySchemaElement { AttributeName = sortKey, KeyType = "S" },
                        },
                        Projection = new Projection { ProjectionType = "ALL" },
                        ProvisionedThroughput = new ProvisionedThroughput
                        {
                            ReadCapacityUnits = (long)5,
                            WriteCapacityUnits = (long)5
                        },
                    });
                }

                var request = new CreateTableRequest
                {
                    TableName = tableName,
                    AttributeDefinitions = attributeDefinitions,
                    KeySchema = tableKeySchema,
                    ProvisionedThroughput = new ProvisionedThroughput
                    {
                        ReadCapacityUnits = 5,
                        WriteCapacityUnits = 5
                    },
                    GlobalSecondaryIndexes = indexes
                };

                var response = _dynamoDbClient.CreateTableAsync(request).Result;

                Console.WriteLine("Table created with request Name: " +
                  response.ResponseMetadata.RequestId);
            }
        }
    }
}
