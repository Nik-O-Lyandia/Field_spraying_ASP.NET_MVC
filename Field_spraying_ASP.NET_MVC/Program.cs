using Microsoft.Extensions.FileProviders;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using Amazon.Runtime;

var builder = WebApplication.CreateBuilder(args);

// Adding DynamoDB local connection
var dynamoDbConfig = builder.Configuration.GetSection("DynamoDb");
var runLocalDynamoDb = dynamoDbConfig.GetValue<bool>("LocalMode");

builder.Services.AddSingleton<IAmazonDynamoDB>(sp =>
{
    var clientConfig = new AmazonDynamoDBConfig
    {
        ServiceURL = dynamoDbConfig.GetValue<string>("LocalServiceUrl")
    };
    return new AmazonDynamoDBClient(clientConfig);
});

builder.Services.AddScoped<IDynamoDBContext, DynamoDBContext>();

// Add services to the container.
builder.Services.AddControllersWithViews();
//builder.Services.AddControllers();
//builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
           Path.Combine(builder.Environment.ContentRootPath, "node_modules")),
    RequestPath = "/node_modules"
});

app.UseStaticFiles();


app.UseRouting();

app.UseAuthorization();

//app.UseEndpoints(endpoints =>
//{
//    endpoints.MapRazorPages();
//    endpoints.MapControllers();
//});

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
