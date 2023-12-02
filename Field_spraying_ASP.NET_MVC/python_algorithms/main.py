import sys

from coverage_trajectory import get_coverage_trajectory

if __name__ == "__main__":
    
    args = sys.argv[1:]
    # print(args)
    # args is a list of the command line args
    try:
        area_name_index = args.index('-a') + 1
        point_name_index = args.index('-p') + 1
        coverage_radius_index = args.index('-r') + 1
        # print(args)
    
        result = get_coverage_trajectory( args[area_name_index], args[point_name_index], float( args[coverage_radius_index] ) )

        # # Debug line
        # result = get_coverage_trajectory( 'area_3', 'point_1', 3.5 )

        print(result)

    except ValueError:
        print("Missing '-a', '-p' or '-r' arguments.")