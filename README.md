It is my diploma project for master degree.
The topic of the diploma is 'Information support system for spraying of agricultural fields using UAVs'.

In this project I developed an information system that allows users to create their accounts, authorize, work with map by adding/deleting Working Areas and Loading Points on it, make Work Plans for spraying and initiate them, add drones and their models.

Information system is featured with algorithm of optimized CPP (Coverage Path Planning) and DynamoDB Service for communication with database.

System's architecture based on client-server model and developed using ASP.NET Core MVC framework.

For map integration OpenLayers API was used. And because it initially runs on Node.js, Webpack packing module was used.

System also uses DynamoDB database because of need to work with potentially huge amount of geopositional data, and NoSQL databases are known to be good in this area.

Simplified version of system's structure scheme is presented on the picture below.
![image](https://github.com/Nik-O-Lyandia/Field_spraying_ASP.NET_MVC/assets/71788948/c124ea64-dd25-424a-86f8-e35eb7a1c19b)
