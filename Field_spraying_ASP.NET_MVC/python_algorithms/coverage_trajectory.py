import boto3
import pyproj
from collections import Counter
from utm import from_latlon, to_latlon

from calculate_coverage import calculate_coverage

def get_coverage_trajectory(area_name:str, spraying_radius):
    '''
    Returns coverage trajectory for selected area.\n
    :area_name: name of the area for which grid would be made.
    '''
    
    TABLE_NAME = "dplm_Area"

    # # Creating the DynamoDB Client
    # dynamodb_client = boto3.client('dynamodb', endpoint_url='http://localhost:8000')

    # Creating the DynamoDB Table Resource
    dynamodb = boto3.resource('dynamodb', endpoint_url='http://localhost:8000')
    table = dynamodb.Table(TABLE_NAME)

    # Getting polygon from DB
    response = table.get_item(
        Key={
            'Name': area_name
        }
    )
    
    # Getting polygon points from dataset
    data_dict = response["Item"]
    polygon = []
    for item in data_dict["Coords"]:
        elem_1 = float(list(item)[0])
        elem_2 = float(list(item)[1])
        if elem_1 < elem_2:
            polygon.append((elem_1, elem_2))
        else:
            polygon.append((elem_2, elem_1))

    # Deleting last point, because it is also the first point
    polygon.pop()

    # print(polygon[:4:])
    
    wgs_proj = pyproj.CRS("EPSG:3857")
    lonlat_proj = pyproj.CRS("EPSG:4326")

    transform_wgs_lonlat = pyproj.Transformer.from_crs(wgs_proj, lonlat_proj, always_xy=True).transform
    transform_lonlat_wgs = pyproj.Transformer.from_crs(lonlat_proj, wgs_proj, always_xy=True).transform

    lonlat_polygon = []
    for p in polygon:
        lonlat_polygon.append(transform_wgs_lonlat(p[0],p[1]))

    # print(lonlat_polygon)
        
    utm_polygon = []
    utm_zones_numbers_and_letters = []
    for p in lonlat_polygon:
        res = from_latlon(p[1],p[0])
        utm_polygon.append((res[0],res[1]))
        utm_zones_numbers_and_letters.append((res[2],res[3]))

    # print(utm_polygon[:4:])

    coverage_trajectory = calculate_coverage(area_name, utm_polygon, spraying_radius)

    zones = list(Counter(utm_zones_numbers_and_letters).keys()) # equals to list(set(words))
    zones_counts = list(Counter(utm_zones_numbers_and_letters).values()) # counts the elements' frequency
    most_used_utm_zone = zones[zones_counts.index(max(zones_counts))]


    lonlat_coverage_trajectory = []
    for p in coverage_trajectory:
        res = to_latlon(p[0],p[1],most_used_utm_zone[0],most_used_utm_zone[1])
        lonlat_coverage_trajectory.append((res[0],res[1]))
    # print(lonlat_coverage_trajectory)

    wgs_coverage_trajectory = []
    for p in lonlat_coverage_trajectory:
        wgs_coverage_trajectory.append(transform_lonlat_wgs(p[1],p[0]))

    # print(wgs_coverage_trajectory[:4:])

    # table.put_item(
    #     Item={
    #         'year': year,
    #         'title': title,
    #         'info': {'plot': plot, 'rating': Decimal(str(rating))}}
    #         )
    return wgs_coverage_trajectory