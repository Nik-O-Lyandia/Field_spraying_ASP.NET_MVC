import math

from point_inside_polygon import checkInside
from split_angle import split_angle

def create_inner_polygon(polygon, distance, concave_splits: int = 1):

    result = []
    for i in range(len(polygon)):
        points_for_angle = []
        if i == 0:
            points_for_angle = [polygon[len(polygon)-1], polygon[i], polygon[i+1]]
        elif i == len(polygon)-1:
            points_for_angle = [polygon[i-1], polygon[i], polygon[0]]
        else:
            points_for_angle = [polygon[i-1], polygon[i], polygon[i+1]]
        
        end_points = split_angle(points_for_angle, distance, concave_splits)
        adjusted_points = []
        for point in end_points:
            if checkInside(polygon, point):
                adjusted_points.append(point)
            # else:
            #     adjusted_points.append(get_point_along_line(polygon[i], point, distance, True))

        result = result + adjusted_points

    return result

# def get_point_along_line(point_1, point_2, distance, backwards = False):
#     dx = point_2[0] - point_1[0]
#     dy = point_2[1] - point_1[1]
#     len = math.sqrt(dx**2 + dy**2)

#     if backwards:
#         dx = -dx
#         dy = -dy

#     return (point_1[0] + dx * (distance / len), point_1[1] + dy * (distance / len))
