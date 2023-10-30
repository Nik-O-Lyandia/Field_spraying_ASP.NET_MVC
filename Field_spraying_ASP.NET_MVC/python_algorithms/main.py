import sys

from coverage_trajectory import get_coverage_trajectory

if __name__ == "__main__":
    
    args = sys.argv[1:]
    # print(args)
    # args is a list of the command line args
    try:
        area_name_index = args.index('-a') + 1
        coverage_radius_index = args.index('-r') + 1
    
        result = get_coverage_trajectory( args[area_name_index], int( args[coverage_radius_index] ) )
        
        # count = 0
        # total_len = 0
        # for r in result:
        # for r in range(840):
            # count = count + 1
        #     total_len = total_len + len(str(count))
            # print(count)
            # print(r)
        # print("FIN")
        # total_len = total_len + 2
        # print(total_len)

        print(result)

    except ValueError:
        print("Missing '-a' or/and '-r' arguments.")