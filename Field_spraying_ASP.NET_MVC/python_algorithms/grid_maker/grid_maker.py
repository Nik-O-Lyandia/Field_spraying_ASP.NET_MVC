from grid_maker import polygon_grid
from grid_maker import inner_polygon

def make_grid(polygon:list, spraying_radius):
    '''
    Returns tuple of grid with global coordinates and numpy 2D array of coverage map for selected area.\n
    :polygon: list of polygon points.
    :spraying_radius: spraying radius of the selected drone.
    '''

    # edge = math.sqrt(10**2/(3/2 * math.sqrt(3)))
    distance = spraying_radius

    # hex_centers, bbox = create_hexgrid(polygon, edge)
    # print("Creating inner polygon...")
    small_polygon = inner_polygon.create_inner_polygon(polygon, distance, 4)
    # print("Inner polygon created.")

    # print("Creating grid...")
    grid_centers_coords, bbox, map_np = polygon_grid.create_grid(small_polygon, distance)
    # print("Grid created.")

    # print("Plotting result...")
    # polygon_grid.plot_result([polygon,small_polygon], [grid_centers_coords], distance=distance, bbox=[bbox[0]-100,bbox[1]-100,bbox[2]+100,bbox[3]+100])
    # print("Plotted.")

    return grid_centers_coords, map_np