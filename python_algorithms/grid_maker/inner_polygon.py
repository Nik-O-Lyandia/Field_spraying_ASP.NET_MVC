
from grid_maker.split_angle import split_angle

def create_inner_polygon(polygon:list, distance, concave_splits: int = 1):
    '''
    Returns inner polygon with [distance] offset.\n
    :polygon: list of polygon points
    :distance: offset distance
    :concave_splits: number of splits for concave angles
    '''

    result = []
    # For every point in polygon
    for i in range(len(polygon)):
        points_for_angle = []
        if i == 0:
            points_for_angle = [polygon[len(polygon)-1], polygon[i], polygon[i+1]]
        elif i == len(polygon)-1:
            points_for_angle = [polygon[i-1], polygon[i], polygon[0]]
        else:
            points_for_angle = [polygon[i-1], polygon[i], polygon[i+1]]
        
        # Finding points for inner polygon
        end_points = split_angle(polygon, points_for_angle, distance, concave_splits)

        result = result + end_points
        print(f"Progress: {i+1} out of {len(polygon)} vertices are done.")

    return result
