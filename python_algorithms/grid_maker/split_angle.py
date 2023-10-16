import math
import matplotlib.pyplot as plt

from grid_maker.point_inside_polygon import checkInside

def angle_between_3_points_atan2(points):
    vector_p1_p2 = (points[0][0]-points[1][0], points[0][1]-points[1][1])
    vector_p3_p2 = (points[2][0]-points[1][0], points[2][1]-points[1][1])

    angle = math.atan2(vector_p3_p2[1],vector_p3_p2[0]) - math.atan2(vector_p1_p2[1],vector_p1_p2[0])
    return angle

def angle_between_3_points_acos(points):
    l1 = math.sqrt((points[0][0] - points[1][0])**2 + (points[0][1] - points[1][1])**2)
    l2 = math.sqrt((points[2][0] - points[1][0])**2 + (points[2][1] - points[1][1])**2)
    l3 = math.sqrt((points[2][0] - points[0][0])**2 + (points[2][1] - points[0][1])**2)

    angle = math.acos((l1**2 + l2**2 - l3**2) / (2 * l1 * l2))
    return angle

def split_angle(polygon: list, points: list, distance, concave_splits: int = 1, from_reflex: bool = False):
    '''
    Returns points for angle of inner polygon\n
    :polygon: list of original polygon points
    :points: list of 3 Tuples (x, y) - [(p1),(p2),(p3)], p2 - center point
    :distance: perpendicular offset from angle
    :concave_splits: number of equal parts to split a concave angle to (no less than 1, meaning 'no additional splits')
    :from_reflex: if call was made from 'build_reflex_angle' function
    '''
    splits = 2
    if from_reflex:
        splits = concave_splits

    # Unpacking the center point
    c_x, c_y = points[1]

    # Calculating angle between p1 and p3 with angle center p2
    angle_p1_p3 = angle_between_3_points_acos(points)

    # Creating point on zero-degree imaginary line
    zero_degree_point = (c_x + 100, c_y)

    # Calculating angle between p1 and zero-degree point
    angle_p1_zeroPoint = angle_between_3_points_atan2([zero_degree_point,points[1],points[0]])

    # Calculating angle between p3 and zero-degree point
    angle_p3_zeroPoint = angle_between_3_points_atan2([zero_degree_point,points[1],points[2]])

    end_points = []
    endx, endy = 0,0
    final_angle = angle_p1_zeroPoint
    # Forming final end-points in global coordinates
    for i in range(splits-1):
        # Determining quarter of coordinate space and calculating angle accordingly
        if angle_p1_zeroPoint < 0:
            if angle_p3_zeroPoint < 0:
                if angle_p1_zeroPoint < angle_p3_zeroPoint:
                    final_angle = final_angle + angle_p1_p3 / splits
                else:
                    final_angle = final_angle - angle_p1_p3 / splits

            if angle_p3_zeroPoint > 0:
                if angle_p3_zeroPoint > angle_p1_zeroPoint + math.pi:
                    final_angle = final_angle - angle_p1_p3 / splits
                else:
                    final_angle = final_angle + angle_p1_p3 / splits

        else:
            if angle_p3_zeroPoint < 0:
                if angle_p3_zeroPoint > angle_p1_zeroPoint - math.pi:
                    final_angle = final_angle - angle_p1_p3 / splits
                else:
                    final_angle = final_angle + angle_p1_p3 / splits
                    
            if angle_p3_zeroPoint > 0:
                if angle_p1_zeroPoint < angle_p3_zeroPoint:
                    final_angle = final_angle + angle_p1_p3 / splits
                else:
                    final_angle = final_angle - angle_p1_p3 / splits

        # Calculate end-point for split
        end_line_len = distance
        if not from_reflex:
            end_line_len = distance / math.sin(angle_p1_p3 / splits)
        endy = c_y + end_line_len * math.sin(final_angle)
        endx = c_x + end_line_len * math.cos(final_angle)

        # If the point inside polygon area - add the point, otherwise - calculate angle as concave
        if checkInside(polygon, (endx, endy)):
            end_points.append((endx, endy))
        else:
            end_points = build_reflex_angle(polygon, points, distance, concave_splits)

    # ***********************************************
    #                  PLOT RESULT
    # ***********************************************

    # # Unzipping points list for plot
    # points_unzipped = list(zip(*points))
    # end_points_unzipped = list(zip(*end_points))

    # # plot the points
    # fig = plt.figure()
    # ax = plt.subplot(1,1,1)
    # ax.set_ylim([min(points_unzipped[1])-50, max(points_unzipped[1])+50])  
    # ax.set_xlim([min(points_unzipped[0])-50, max(points_unzipped[0])+50])
    # # ax.set_xlim([min(points_unzipped[0])-50, max(points_unzipped[0]) + max(points_unzipped[1])-min(points_unzipped[1])+50])
    # for i in range(len(end_points)):
    #     ax.plot([c_x, end_points[i][0]], [c_y, end_points[i][1]])
    
    # ax.plot([c_x, points[0][0]], [c_y, points[0][1]])
    # ax.plot([c_x, points[2][0]], [c_y, points[2][1]])
    # ax.scatter(points_unzipped[0], points_unzipped[1])
    # ax.scatter(end_points_unzipped[0], end_points_unzipped[1])
    # ax.scatter(zero_degree_point[0],zero_degree_point[1])

    # ax.grid(which = "major", linewidth = 1, linestyle = '-')
    # ax.grid(which = "minor", linewidth = 0.2, linestyle = '--')
    # ax.minorticks_on()

    # plt.show()

    # print()
    return end_points


def build_reflex_angle(polygon:list, points: list, distance, splits: int = 2):
    '''
    Returns points for concave angle\n
    :polygon: list of original polygon points
    :points: list of 3 Tuples (x, y) - [(p1),(p2),(p3)], p2 - center point
    :distance: perpendicular offset from angle
    :splits: number of equal parts to split an angle to (no less than 2)
    '''

    # Unpacking the center point
    c_x, c_y = points[1]

    # Creating point on zero-degree imaginary line
    zero_degree_point = (c_x + 100, c_y)

    # Calculating angle between p1 and zero-degree point
    angle_p1_zeroPoint = angle_between_3_points_atan2([zero_degree_point,points[1],points[0]])

    # Calculating angle between p3 and zero-degree point
    angle_p3_zeroPoint = angle_between_3_points_atan2([zero_degree_point,points[1],points[2]])

    final_angle_1 = angle_p1_zeroPoint
    final_angle_2 = angle_p3_zeroPoint
    
    # If angle somehow equal to 180 degree
    if final_angle_1 + final_angle_2 == math.pi:
        if final_angle_1 > math.pi/2:
            final_angle_1 = final_angle_1 - math.pi/2
        else:
            final_angle_1 = final_angle_1 + math.pi/2
        endy = c_y + distance * math.sin(final_angle_1)
        endx = c_x + distance * math.cos(final_angle_1)
        return [(endx,endy)]
    
    # Determining quarter of coordinate space and calculating angle accordingly
    if final_angle_1 < 0:
        if final_angle_2 > 0:
            if abs(final_angle_1) + final_angle_2 > math.pi:
                final_angle_1 = final_angle_1 + math.pi/2
                final_angle_2 = final_angle_2 - math.pi/2
            else:
                final_angle_1 = final_angle_1 - math.pi/2
                final_angle_2 = final_angle_2 + math.pi/2
        
        elif final_angle_2 < 0:
            if final_angle_1 < final_angle_2:
                final_angle_1 = final_angle_1 - math.pi/2
                final_angle_2 = final_angle_2 + math.pi/2
            else: 
                final_angle_1 = final_angle_1 + math.pi/2
                final_angle_2 = final_angle_2 - math.pi/2

    else:
        if final_angle_2 < 0:
            if final_angle_1 + abs(final_angle_2) > math.pi:
                final_angle_1 = final_angle_1 - math.pi/2
                final_angle_2 = final_angle_2 + math.pi/2
            else:
                final_angle_1 = final_angle_1 + math.pi/2
                final_angle_2 = final_angle_2 - math.pi/2

        elif final_angle_2 > 0:
            if final_angle_1 < final_angle_2:
                final_angle_1 = final_angle_1 - math.pi/2
                final_angle_2 = final_angle_2 + math.pi/2
            else: 
                final_angle_1 = final_angle_1 + math.pi/2
                final_angle_2 = final_angle_2 - math.pi/2


    # Calculate end-points for perpendiculars
    endx_1 = c_x + distance * math.cos(final_angle_1)
    endy_1 = c_y + distance * math.sin(final_angle_1)
    end_point_1 = (endx_1,endy_1)

    endx_2 = c_x + distance * math.cos(final_angle_2)
    endy_2 = c_y + distance * math.sin(final_angle_2)
    end_point_2 = (endx_2,endy_2)

    # Recursive call of split_angle, but to split concave angle
    split_points = split_angle(polygon, [end_point_1,points[1],end_point_2], distance, splits, True)
    
    return [end_point_1] + split_points + [end_point_2]

# ***********************************************
#                 USAGE EXAMPLE
# ***********************************************
# points = [(4,7),(8,8),(7,2)]
# find_bisector(points)