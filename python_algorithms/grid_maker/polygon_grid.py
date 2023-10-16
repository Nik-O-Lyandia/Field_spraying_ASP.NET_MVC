import math
from matplotlib import pyplot as plt
import numpy as np

from grid_maker import point_inside_polygon

def create_hexagon(l, x, y):
    """
    Create a hexagon centered on (x, y)
    :param l: length of the hexagon's edge
    :param x: x-coordinate of the hexagon's center
    :param y: y-coordinate of the hexagon's center
    :return: The polygon containing the hexagon's coordinates
    """
    c = [[x + math.cos(math.radians(angle)) * l, y + math.sin(math.radians(angle)) * l] for angle in range(0, 360, 60)]
    return c

def create_square(l, x, y):
    """
    Create a square centered on (x, y)
    :param l: length of the square's edge
    :param x: x-coordinate of the square's center
    :param y: y-coordinate of the square's center
    :return: The polygon containing the square's coordinates
    """
    c = []
    c.append([x-l/2,y-l/2])
    c.append([x-l/2,y+l/2])
    c.append([x+l/2,y+l/2])
    c.append([x+l/2,y-l/2])

    return c

def create_hexgrid(polygon, side):
    """
    returns an array of Points describing hexagons centers that are inside the given bounding_box
    :param bbox: The containing bounding box. The bbox coordinate should be in Webmercator.
    :param side: The size of the hexagons'
    :return: The hexagon grid
    """
    grid = []

    v_step = math.sqrt(3) * side
    h_step = 1.5 * side

    bbox = []
    polygon_unziped = list(zip(*polygon))
    bbox.append(min(polygon_unziped[0]))
    bbox.append(min(polygon_unziped[1]))
    bbox.append(max(polygon_unziped[0]))
    bbox.append(max(polygon_unziped[1]))

    x_min = min(bbox[0], bbox[2])
    x_max = max(bbox[0], bbox[2])
    y_min = min(bbox[1], bbox[3])
    y_max = max(bbox[1], bbox[3])

    h_skip = math.ceil(x_min / h_step) - 1
    h_start = h_skip * h_step

    v_skip = math.ceil(y_min / v_step) - 1
    v_start = v_skip * v_step

    h_end = x_max + h_step
    v_end = y_max + v_step

    if v_start - (v_step / 2.0) < y_min:
        v_start_array = [v_start + (v_step / 2.0), v_start]
    else:
        v_start_array = [v_start - (v_step / 2.0), v_start]

    v_start_idx = int(abs(h_skip) % 2)

    c_x = h_start
    c_y = v_start_array[v_start_idx]
    v_start_idx = (v_start_idx + 1) % 2
    while c_x < h_end:
        while c_y < v_end:
            if point_inside_polygon.checkInside(polygon=polygon, p=(c_x,c_y)):
                grid.append((c_x, c_y))
            c_y += v_step
        c_x += h_step
        c_y = v_start_array[v_start_idx]
        v_start_idx = (v_start_idx + 1) % 2

    return grid, bbox

# *********************************************

def create_grid(polygon, distance):
    """
    Returns an tuple consists of: list of grid centers points, bbox of polygon and map for coverage planner\n
    :polygon: Initial list of polygon points.
    :distance: The size of the hexagons' OR the radius of circle.
    """
    grid = []

    bbox = []
    polygon_unziped = list(zip(*polygon))
    bbox.append(min(polygon_unziped[0]))
    bbox.append(min(polygon_unziped[1]))
    bbox.append(max(polygon_unziped[0]))
    bbox.append(max(polygon_unziped[1]))
    
    # grid_size = [math.ceil((bbox[2]-bbox[0]) / (2*distance)), math.ceil((bbox[3]-bbox[1]) / (2*distance))]

    x_min = min(bbox[0], bbox[2])
    x_max = max(bbox[0], bbox[2])
    y_min = min(bbox[1], bbox[3])
    y_max = max(bbox[1], bbox[3])

    i = 0
    y_cur = y_min
    map_in_tiles = []
    while y_cur < y_max:
        x_cur = x_min
        map_row = []
        grid_row = []
        while x_cur < x_max:
            c_x = x_cur + distance / 2
            c_y = y_cur + distance / 2
            if point_inside_polygon.checkInside(polygon=polygon, p=(c_x,c_y)):
                grid_row.append((c_x,c_y))
                map_row.append(0)
            else:
                grid_row.append(-1)
                map_row.append(1)
            x_cur = x_cur + 2*distance
            i = i + 1
        y_cur = y_cur + 2*distance
        grid.append(grid_row)
        map_in_tiles.append(map_row)
    
    # Making coverage map for CPP algorithm
    map_np_rotated_90 = np.array(map_in_tiles)
    # map_np = np.rot90(map_np_rotated_90)
    grid = grid[::-1]
    map_np = map_np_rotated_90[::-1]

    # ****************************************************
    #                   TO DO
    # ****************************************************
    for i in range(len(map_np)-1,-1,-1):
        for j in range(len(map_np[i])-1,-1,-1):
            if map_np[i][j] == 0:
                map_np[i][j] = 2
                print(f"{i} / {j}")
                break
        else:
            continue
        break
    # ****************************************************
    #                   TO DO
    # ****************************************************

    # Getting key points on perimeter trajectory vertices
    grid_row = []
    for i in range(len(polygon)):
        grid_row.append(polygon[i])
    if not grid_row == []:
        grid.append(grid_row)

    return grid, bbox, map_np

# *********************************************

def plot_result(features, grid_points_list, distance, bbox):

    fig = plt.figure(figsize=(20,10))
    ax = fig.add_subplot(1, 1, 1)
    
    for feature in features:

        feature.append(feature[0])
        feature_unziped = list(zip(*feature))

        ax.plot(feature_unziped[0],feature_unziped[1])

    for grid_points in grid_points_list:
        res_squares = []
        res_squares.append([])
        res_squares.append([])

        grid = []
        for grid_row in grid_points:
            # hex_grid = []
            # for hex_center in hex_centers:
            #     hex_grid.append(create_hexagon(edge,hex_center[0],hex_center[1]))
            for center in grid_row:
                if not center == -1:
                    grid.append(create_square(distance,center[0],center[1]))
                    res_squares[0].append(center[0])
                    res_squares[1].append(center[1])
                    Drawing_uncolored_circle = plt.Circle( (center[0],center[1]), distance, fill = False )
                    ax.add_artist( Drawing_uncolored_circle )

            ax.set_aspect( 1 )
            # res = list(zip(*hex_centers))
            # res_squares = list(zip(*grid_row))

            # hex_grid_unziped = []
            # for hex in hex_grid:
            #     hex.append(hex[0])
            #     hex_grid_unziped.append(list(zip(*hex)))
        grid_unziped = []
        for square in grid:
            square.append(square[0])
            grid_unziped.append(list(zip(*square)))

        # for hex in hex_grid_unziped:
        #     ax.plot(hex[0],hex[1])
        # for square in grid_unziped:
        #     ax.plot(square[0],square[1])

        # ax.scatter(res[0], res[1])
        ax.scatter(res_squares[0], res_squares[1])

    xlim_min = bbox[0]
    xlim_max = bbox[2]
    ylim_min = bbox[1]
    ylim_max = bbox[3]

    plt.xlim([xlim_min, xlim_min + 2*(ylim_max-ylim_min)])
    plt.ylim([ylim_min, ylim_max])

    ax.grid(which = "major", linewidth = 1, linestyle = '-')
    ax.grid(which = "minor", linewidth = 0.2, linestyle = '--')
    ax.minorticks_on()

    plt.show()
