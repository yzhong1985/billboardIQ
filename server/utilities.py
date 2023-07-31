import numpy as np
import pandas as pd
import geopandas as gpd
from sklearn.neighbors import KDTree
import methods

# return a binary (only contain 0 or 1) array  
# the array [a, b] indicates if the point y[b] is within the r distance of x[a] 
def distance_matrix_binary(x, y, r):
    x = np.asarray(x)
    y = np.asarray(y)
    (M, k) = x.shape
    (N, kk) = y.shape
    if k != kk:
        raise ValueError('The length of the second dimensions of x and y must be equal'
                         )
    if r < 0:
        raise ValueError('Radius must be a non-negative number.')
    mat = np.zeros((M, N), dtype=bool)
    if M < N:
        tree = KDTree(y)
        idx = tree.query_radius(x, r, count_only=False,
                                return_distance=False)
        for i in range(M):
            mat[i, idx[i]] = 1
        return mat
    else:
        tree = KDTree(x)
        idx = tree.query_radius(y, r, count_only=False,
                                return_distance=False)
        for i in range(N):
            mat[idx[i], i] = 1
        return mat

# the actual function to solve the result
def solve_result(demand_filepath, bb_filepath, radius, max_count, cost_field, budget, value_field, opened):
    # read from demand file and facilities file
    demand_ls = gpd.read_file(demand_filepath)
    billboards_ls = pd.read_csv(bb_filepath)
    demand_ls['easting'] = demand_ls.geometry.x
    demand_ls['northing'] = demand_ls.geometry.y
    I = len(demand_ls)
    J = len(billboards_ls)
    s = distance_matrix_binary(demand_ls[['easting', 'northing']].values, billboards_ls[['POINT_X', 'POINT_Y']].values, radius)
    # pricing of the billboard array
    cost = billboards_ls[cost_field]
    # value of the demand pts array
    v = demand_ls[value_field]
    # Run mclp opt_sites is the location of optimal sites and f is the points covered
    opt_billboards, total_covered_val = methods.mclp_gurobi.solve_mclp(I, J, s, max_count, cost, budget, v, opened)
    billboards = billboards_ls.iloc[opt_billboards]
    return billboards, total_covered_val




