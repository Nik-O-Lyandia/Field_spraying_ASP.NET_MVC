import math
import sys
import boto3
from boto3.dynamodb.conditions import Key
import json

import polygon_grid
import inner_polygon

def main(argv: list, arc):
    args = argv[1:]
    # args is a list of the command line args

    # if args '-p':
    #     polygon = list(args[1])

    TABLE_NAME = "dplm_Area"

    # Creating the DynamoDB Client
    dynamodb_client = boto3.client('dynamodb', endpoint_url='http://localhost:8000')

    # Creating the DynamoDB Table Resource
    dynamodb = boto3.resource('dynamodb', endpoint_url='http://localhost:8000')
    table = dynamodb.Table(TABLE_NAME)

    response = table.get_item(
        Key={
            'Name': 'area_1'
        }
    )
    # data = json.loads(str(response["Item"]))
    data_dict = response["Item"]
    # print(data_dict["Coords"][0])
    # print(type(float(list(data_dict["Coords"][0])[0])))
    polygon = []
    for item in data_dict["Coords"]:
        # print(item)
        elem_1 = float(list(item)[0])
        elem_2 = float(list(item)[1])
        if elem_1 < elem_2:
            polygon.append((elem_1, elem_2))
        else:
            polygon.append((elem_2, elem_1))

    polygon.pop()
    # print()
    # polygon = [(1135,4259),(1094,4388),(1196,4671),(1245,4575),(1438,4680),(1375,4410),(1426,4314),(1252,4316),(1280,4370)]
    # print(polygon)
    # if not isConvex(polygon):
    #     raise ValueError("Polygon is concave")
    edge = math.sqrt(10**2/(3/2 * math.sqrt(3)))
    edge = 50

    # hex_centers, bbox = create_hexgrid(polygon, edge)
    print("Creating inner polygon...")
    small_polygon = inner_polygon.create_inner_polygon(polygon, edge, 4)
    print("Inner polygon created.")

    print("Creating grid...")
    # grid_centers, bbox = polygon_grid.create_grid(small_polygon, edge)
    grid_centers = [(0,0)]
    bbox = []
    polygon_unziped = list(zip(*polygon))
    bbox.append(min(polygon_unziped[0]))
    bbox.append(min(polygon_unziped[1]))
    bbox.append(max(polygon_unziped[0]))
    bbox.append(max(polygon_unziped[1]))
    print("Grid created.")

    print("Plotting result...")
    polygon_grid.plot_result([polygon,small_polygon], [grid_centers], distance=edge, bbox=[bbox[0]-100,bbox[1]-100,bbox[2]+100,bbox[3]+100])
    print("Plotted.")

if __name__ == "__main__":
    main(sys.argv, len(sys.argv))