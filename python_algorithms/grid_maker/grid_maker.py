import math

import polygon_grid
import inner_polygon


polygon = [(1135,4259),(1094,4388),(1196,4671),(1245,4575),(1338,4680),(1275,4410),(1326,4314),(1252,4316),(1280,4370)]

# if not isConvex(polygon):
#     raise ValueError("Polygon is concave")

edge = math.sqrt(10**2/(3/2 * math.sqrt(3)))
edge = 10

# hex_centers, bbox = create_hexgrid(polygon, edge)
grid_centers, bbox = polygon_grid.create_grid(polygon, edge)

small_polygon = inner_polygon.create_inner_polygon(polygon, edge, 10)

polygon_grid.plot_result([polygon,small_polygon], [grid_centers], edge=edge, bbox=bbox)