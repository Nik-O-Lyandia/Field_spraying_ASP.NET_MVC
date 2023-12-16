from grid_maker import polygon_grid
from grid_maker import inner_polygon

def make_grid(polygon:list, loading_point: tuple, spraying_radius):
    '''
    Returns tuple of grid with global coordinates and numpy 2D array of coverage map for selected area.\n
    :polygon: list of polygon points.
    :spraying_radius: spraying radius of the selected drone.
    '''

    distance = spraying_radius

    small_polygon = inner_polygon.create_inner_polygon(polygon, distance, 4)

    grid_centers_coords, bbox, map_np = polygon_grid.create_grid(small_polygon, loading_point, distance)

    # polygon_grid.plot_result([polygon,small_polygon], [grid_centers_coords], distance=distance, bbox=[bbox[0]-100,bbox[1]-100,bbox[2]+100,bbox[3]+100])

    return grid_centers_coords, map_np