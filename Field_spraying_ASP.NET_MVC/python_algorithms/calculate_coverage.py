import numpy as np
from coverage_planner import CoveragePlanner, HeuristicType, PlannerStatus
from tabulate import tabulate

# from coverage_test import plot_map
from grid_maker.grid_maker import make_grid

def calculate_coverage(area_name:str, polygon:list, spraying_radius):
    cp_debug_level = 0
    # test_show_each_result = False

    # maps = ["map1", "map2", "map3", "map4"]
    cp_heuristics = [HeuristicType.VERTICAL,
                    HeuristicType.HORIZONTAL, HeuristicType.CHEBYSHEV, HeuristicType.MANHATTAN]
    orientations = [0, 1, 2, 3]

    # for map_name in maps:
    compare_tb = []

    grid_centers_coords, target_map = make_grid(polygon, spraying_radius)
    # print(target_map)

    cp = CoveragePlanner(target_map)
    cp.set_debug_level(cp_debug_level)

    # Iterate over each orientation with each heuristic
    for heuristic in cp_heuristics:
        for orientation in orientations:
            # if test_show_each_result:
            #     print("\n\nIteration[map:{}, cp:{}, initial_orientation:{}]".format(
            #         area_name, heuristic.name, orientation))

            cp.start(initial_orientation=orientation, cp_heuristic=heuristic)
            cp.compute()

            # if test_show_each_result:
            #     cp.show_results()

            res = [heuristic.name, orientation]
            res.extend(cp.result())
            compare_tb.append(res)
            
    # Sort by number of steps
    compare_tb.sort(key=lambda x: (x[3], x[4]))

    # Show results
    # print("Map tested: {}".format(area_name))

    # Print the summary of results for the given map
    summary = [row[0:5] for row in compare_tb]
    for row in summary:
        # Format cost to 2 decimal
        row[4] = "{:.2f}".format(row[4])
        # Convert movement index to movement names
        row[1] = cp.movement_name[row[1]]

    compare_tb_headers = ["Heuristic",
                        "Orientation", "Found?", "Steps", "Cost"]
    summary_tb = tabulate(summary, compare_tb_headers,
                        tablefmt="pretty", floatfmt=".2f")
    # print(summary_tb)

    # # Print the policy map of the best coverage planner
    # cp.print_policy_map(trajectory=compare_tb[0][5], trajectory_annotations=[])

    # cp.print_trajectory(trajectory=compare_tb[0][5])

    # # Plot the complete trajectory map
    # plot_map(target_map, compare_tb[0][5], map_name=area_name,
    #         params_str="Heuristic:{}, Initial Orientation: {}".format(compare_tb[0][0], cp.movement_name[compare_tb[0][1]]))

    # # Print the best path
    # print("\nList of coordinates of the best path: [map:{}, initial orientation: {} ({}), coverage path Heuristic:{}]".format(
    #     area_name, cp.movement_name[compare_tb[0][1]], compare_tb[0][1], compare_tb[0][0]))
    # print(compare_tb[0][6])
    # print("\n\n")

    path_coordinates = []
    for path_point in compare_tb[0][6]:
        path_coordinates.append(grid_centers_coords[path_point[0]][path_point[1]])
    for perimeter_path_point in grid_centers_coords[len(grid_centers_coords)-1]:
        path_coordinates.append(perimeter_path_point)
    # print(grid_centers_coords)
    # (3760680.1893919758, 6785271.660893782)
    # 3760680.1893919758, 6784191.660893782
    
    # print(path_coordinates)

    return path_coordinates