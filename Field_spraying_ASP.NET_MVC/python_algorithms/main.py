import sys

from coverage_trajectory import get_coverage_trajectory

if __name__ == "__main__":
    
    args = sys.argv[1:]
    
    try:
        area_name_index = args.index('-a') + 1
        point_name_index = args.index('-p') + 1
        coverage_radius_index = args.index('-r') + 1
    
        result = get_coverage_trajectory( args[area_name_index], args[point_name_index], float( args[coverage_radius_index] ) )

        print(result)

    except ValueError:
        print("Missing '-a', '-p' or '-r' arguments.")