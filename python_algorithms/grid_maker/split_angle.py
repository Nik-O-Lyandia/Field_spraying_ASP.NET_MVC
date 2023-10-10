import math
import matplotlib.pyplot as plt

def angle_between_3_points(points):
    vector_p1_p2 = (points[0][0]-points[1][0], points[0][1]-points[1][1])
    vector_p3_p2 = (points[2][0]-points[1][0], points[2][1]-points[1][1])

    angle = math.atan2(vector_p3_p2[1],vector_p3_p2[0]) - math.atan2(vector_p1_p2[1],vector_p1_p2[0])
    return angle

def split_angle(points: list, distance, concave_splits: int = 1, from_reflex: bool = False):
    '''
            ----NECESSARY FORMAT----
    points - list of 3 Tuples (x, y) - [(p1),(p2),(p3)];
    p2 - center point\n
    distance - perpendicular offset from angle\n
    concave_splits - number of equal parts to split a concave angle to (no less than 1, meaning 'no additional splits')
    '''
    splits = 2
    if from_reflex:
        splits = concave_splits

    angle_is_convex = True
    # Unpacking the center point
    c_x, c_y = points[1]

    # Calculating angle between p1 and p3 with angle center p2
    angle_p1_p3 = angle_between_3_points(points)
    print(f"p1-p3 degree: rad - {angle_p1_p3}; deg - {math.degrees(angle_p1_p3)}")
    if angle_p1_p3 < 0 and not from_reflex:
        angle_is_convex = False
        # angle_p1_p3 = -angle_p1_p3
    if angle_p1_p3 < 0 and from_reflex:
        angle_p1_p3 = angle_p1_p3 + 2*math.pi
    # elif angle_p1_p3 < 0 and from_reflex:
    #     angle_p1_p3 = -angle_p1_p3

    # Creating point on zero-degree imaginary line
    zero_degree_point = (c_x + 100, c_y)

    # Calculating angle between p1 and zero-degree point
    angle_p1_zeroPoint = angle_between_3_points([zero_degree_point,points[1],points[0]])
    # if angle_p1_zeroPoint < 0:
    #     angle_p1_zeroPoint = -angle_p1_zeroPoint

    # Calculating angle between p3 and zero-degree point
    angle_p3_zeroPoint = angle_between_3_points([zero_degree_point,points[1],points[2]])
    # if angle_p3_zeroPoint < 0:
    #     angle_p3_zeroPoint = -angle_p3_zeroPoint
    
    # print(points)

    end_points = []
    if angle_is_convex:
        final_angle = angle_p1_zeroPoint
        # Forming final bisector angle in global coordinates
        for i in range(splits-1):
            # Choosing smallest angle between p1-zeroPoint and p3-zeroPoint
            #     # If p1 lays under center point (Y coord <), then mirror p1-zeroPoint angle horizontally
            #     # If p3 lays under center, then - half p1-p3 angle. Otherwise +
            #     # If p3 lays under center point (Y coord <), then mirror p3-zeroPoint angle horizontally
            #     # If p1 lays under center, then - half p1-p3 angle. Otherwise +

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

            # Calculate end-point for bisector
            end_line_len = distance
            if not from_reflex:
                end_line_len = distance / math.sin(angle_p1_p3 / splits)
            endy = c_y + end_line_len * math.sin(final_angle)
            endx = c_x + end_line_len * math.cos(final_angle)

            print(f"Final angle: rad - {final_angle}; deg - {math.degrees(final_angle)}")
            # print((endx, endy))
            end_points.append((endx, endy))
    else:
        print("-----REFLEX ANGLE START-----")
        end_points = build_reflex_angle(points, distance, concave_splits)
    # line_p1_end = math.sqrt((points[0][0] - endx)**2 + (points[0][1] - endy)**2)
    # line_p3_end = math.sqrt((points[2][0] - endx)**2 + (points[2][1] - endy)**2)
    
    # angle_p1_end = math.acos((line_1_len**2 + end_line_len**2 - line_p1_end**2) / (2 * line_1_len * end_line_len))
    # angle_p3_end = math.acos((line_2_len**2 + end_line_len**2 - line_p3_end**2) / (2 * line_2_len * end_line_len))

    # print(angle_p1_end)
    # print(angle_p3_end)

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

    print()
    return end_points


def build_reflex_angle(points: list, distance, splits: int = 2):
    '''
            ----NECESSARY FORMAT----
    points - list of 3 Tuples (x, y) - [(p1),(p2),(p3)];
    p2 - center point\n
    distance - perpendicular offset from angle\n
    splits - number of equal parts to split an angle to (no less than 2)
    '''

    # Unpacking the center point
    c_x, c_y = points[1]

    # Creating point on zero-degree imaginary line
    zero_degree_point = (c_x + 100, c_y)

    # Calculating angle between p1 and zero-degree point
    angle_p1_zeroPoint = angle_between_3_points([zero_degree_point,points[1],points[0]])
    # if angle_p1_zeroPoint < 0:
    #     angle_p1_zeroPoint = -angle_p1_zeroPoint

    # Calculating angle between p3 and zero-degree point
    angle_p3_zeroPoint = angle_between_3_points([zero_degree_point,points[1],points[2]])
    # if angle_p3_zeroPoint < 0:
    #     angle_p3_zeroPoint = -angle_p3_zeroPoint
    print(f"angle_p1_zeroPoint degree: rad - {angle_p1_zeroPoint}; deg - {math.degrees(angle_p1_zeroPoint)}")
    print(f"angle_p3_zeroPoint degree: rad - {angle_p3_zeroPoint}; deg - {math.degrees(angle_p3_zeroPoint)}")

    final_angle_1 = angle_p1_zeroPoint
    final_angle_2 = angle_p3_zeroPoint
    
    if final_angle_1 + final_angle_2 == math.pi:
        if final_angle_1 > math.pi/2:
            final_angle_1 = final_angle_1 - math.pi/2
        else:
            final_angle_1 = final_angle_1 + math.pi/2
        endy = c_y + distance * math.sin(final_angle_1)
        endx = c_x + distance * math.cos(final_angle_1)
        return [(endx,endy)]
    
    # if points[0][1] < points[1][1]:
    if final_angle_1 < 0:
        # final_angle_1 = -final_angle_1 + 2*math.pi
        # if points[2][1] > points[1][1]:
        if final_angle_2 > 0:
            if final_angle_1 >= -math.pi/2 or final_angle_2 <= math.pi/2:
                final_angle_1 = final_angle_1 - math.pi/2
                final_angle_2 = final_angle_2 + math.pi/2
            
            elif final_angle_1 < -math.pi/2 or final_angle_2 > math.pi/2:
                final_angle_1 = final_angle_1 + math.pi/2
                final_angle_2 = final_angle_2 - math.pi/2
        
        # if points[2][1] < points[1][1]:
        if final_angle_2 < 0:
            # final_angle_2 = -final_angle_2 + 2*math.pi
            if final_angle_1 < final_angle_2:
                final_angle_1 = final_angle_1 - math.pi/2
                final_angle_2 = final_angle_2 + math.pi/2
            else: 
                final_angle_1 = final_angle_1 + math.pi/2
                final_angle_2 = final_angle_2 - math.pi/2

    else:
        # if points[2][1] < points[1][1]:
        if final_angle_2 < 0:
            # final_angle_2 = -final_angle_2 + 2*math.pi
            if final_angle_1 <= math.pi/2 or final_angle_2 >= -math.pi/2:
                final_angle_1 = final_angle_1 + math.pi/2
                final_angle_2 = final_angle_2 - math.pi/2
            
            elif final_angle_1 > math.pi/2 or final_angle_2 < -math.pi/2:
                final_angle_1 = final_angle_1 - math.pi/2
                final_angle_2 = final_angle_2 + math.pi/2

        # if points[2][1] > points[1][1]:
        if final_angle_2 > 0:
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

    # CHECKing
    # angle_p1_end_1 = angle_between_3_points([points[0],points[1],end_point_1])
    # angle_p3_end_2 = angle_between_3_points([points[2],points[1],end_point_2])
    # print(f"p1-end_1 degree: rad - {angle_p1_end_1}; deg - {math.degrees(angle_p1_end_1)}")
    # print(f"p1-end_2 degree: rad - {angle_p3_end_2}; deg - {math.degrees(angle_p3_end_2)}")

    angle_zeroPoint_end_1 = angle_between_3_points([zero_degree_point,points[1],end_point_1])
    angle_zeroPoint_end_2 = angle_between_3_points([zero_degree_point,points[1],end_point_2])
    print(f"zeroPoint-end_1 degree: rad - {angle_zeroPoint_end_1}; deg - {math.degrees(angle_zeroPoint_end_1)}")
    print(f"zeroPoint-end_2 degree: rad - {angle_zeroPoint_end_2}; deg - {math.degrees(angle_zeroPoint_end_2)}")
    print("\t-----INNER CALL START-----")

    split_points = split_angle([end_point_1,points[1],end_point_2], distance, splits, True)
    print("\t-----INNER CALL END-----")

    print("-----REFLEX ANGLE END-----")
    return [end_point_1] + split_points + [end_point_2]
    # return [end_point_1] + [end_point_2]

    # print(math.degrees(final_angle))
    # print([endx, endy])


# ***********************************************
#                 USAGE EXAMPLE
# ***********************************************
# points = [(4,7),(8,8),(7,2)]
# find_bisector(points)