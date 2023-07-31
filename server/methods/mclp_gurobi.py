import numpy as np
import pandas as pd

from matplotlib import pyplot as plt
from scipy.spatial import distance_matrix

from scipy.spatial import ConvexHull
from shapely.geometry import Polygon, Point, MultiPoint
from numpy import random
from sklearn.neighbors import KDTree
import multiprocessing as mp
import geopandas as gpd

## import gurobi python library
import gurobipy as gp
import time

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

# random select m sites from the given site, if m is not provided, return all the sites
def generate_candidate_sites(sites, M=100):
    '''
    Generate M candidate sites with the convex hull of a point set
    Input:
        sites: a Pandas DataFrame with X, Y and other characteristic
        M: the number of candidate sites to generate
    Return:
        sites: a Numpy array with shape of (M,2)
    '''
    if M is not None:
        if M > len(sites):
            M = None
    if M is None:
        return sites
    
    index = np.random.choice(len(sites), M)
    return sites.iloc[index]        
    
# the old methods (deprecated) -- testing now
def mclp_landscan_ex_gurobi(ls, bbs, current_bbs, value_field, K, radius, M, pricingfield, budget):
    
    bbs_ = generate_candidate_sites(bbs, M)
    current_bbs = pd.DataFrame(current_bbs, columns=['POINT_X','POINT_Y'])
    current_bbs['current'] = True
    bbs_.loc['current'] = False
    bbs = current_bbs.append(bbs_, ignore_index=True, verify_integrity=True)
    bbs = bbs.reset_index()
    J = len(bbs)  # indexing for facility sites
    I = len(ls)  # indexing for population (clients)
    D = distance_matrix_binary(ls[['easting', 'northing']].values, bbs[['POINT_X', 'POINT_Y']].values, radius)

    cost = bbs[pricingfield]

    pop = ls[value_field]
    # Build model
    m = gp.Model()
    # Add variables
    x = {}
    y = {}
    current = len(current_bbs)

    for i in range(I):
        y[i] = m.addVar(vtype=gp.GRB.BINARY, name='y%d' % i)

    for j in range(J):
        x[j] = m.addVar(vtype=gp.GRB.BINARY, name='x%d' % j)

    m.update()

    # Add constraints
    m.addConstr(gp.quicksum(x[j] for j in range(J)) <= K)

    if budget > 0:
        m.addConstr(gp.quicksum(x[j]*cost[j] for j in range(J)) <= budget, "budget")

    for j in range(current):
        m.addConstr(x[j] == 1)

    for i in range(I):
        m.addConstr(gp.quicksum(x[j] for j in np.where(D[i] == 1)[0]) >= y[i])

    m.setObjective(gp.quicksum(y[i] * pop[i] for i in range(I)), gp.GRB.MAXIMIZE)
    m.setParam('OutputFlag', 0)
    m.optimize()

    solution = []
    if m.status == gp.GRB.Status.OPTIMAL:
        for v in m.getVars():
            if v.x == 1 and v.varName[0] == 'x':
                solution.append(int(v.varName[1:]))

    opt_bbs = bbs.iloc[solution]

    return (opt_bbs, m.objVal)


# I and J are the number of demand points and potential facility locations, 
# The s parameter is a dictionary that indicates whether a demand point i is within the service range of location j
# The c parameter is the maximum number of facilities that can be opened.
# v representing the value associated with each demand point. 
# budget = 0 means no budget limit
def solve_mclp(I, J, s, max_count, cost, budget, v, opened):
    # Create a new model
    m = gp.Model("mclp")

    # Create variables
    x = m.addVars(J, vtype=gp.GRB.BINARY, name="x")
    y = m.addVars(I, vtype=gp.GRB.BINARY, name="y")

    # Fix variables for already opened facilities
    for j in opened:
        x[j].setAttr('lb', 1)

    # Set objective
    m.setObjective(gp.quicksum(v[i]*y[i] for i in range(I)), gp.GRB.MAXIMIZE)

    # Add coverage constraints
    m.addConstrs((gp.quicksum(s[i,j]*x[j] for j in range(J)) >= y[i] for i in range(I)), "coverage")

    # Add service limit constraint
    m.addConstr(gp.quicksum(x[j] for j in range(J)) <= max_count, "facilities")

    # Add budget constraint
    if budget > 0:
        m.addConstr(gp.quicksum(x[j]*cost[j] for j in range(J)) <= budget, "budget")

    # Optimize model
    m.optimize()
    
    decision_vars = {v.VarName: v.x for v in m.getVars()}
    objective_value = m.objVal

    return decision_vars, objective_value


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
    opt_sites, total_covered = solve_mclp(I, J, s, max_count, cost, budget, v, opened)
    return opt_sites, total_covered


# the old function to solve the result
def solve_result_old(demand_filepath, bb_filepath, radius, max_count, cost_field, budget, value_field, opened):
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

    opt_sites, total_covered = mclp_landscan_ex_gurobi(demand_ls, billboards_ls, [], value_field, max_count, radius, None, cost_field, budget)

    # opt_sites, total_covered = solve_mclp(I, J, s, max_count, cost, budget, v, opened)
    return opt_sites, total_covered


def run_tester():
    # Number of demand points and potential facility locations
    I = 5
    J = 3
    # Coverage matrix (s[i, j] = 1 if demand point i is within the service range of location j)
    s = np.array([[1, 0, 0],
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 1],
                [0, 1, 0]])
    max_count = 2  # Maximum number of facilities that can be opened
    # Costs associated with each facility
    cost = np.array([100, 200, 150])
    # Total budget
    budget = 300
    # Value associated with each demand point
    v = np.array([10, 20, 30, 40, 50])
    # Already opened facilities
    opened = [1]  # Facility 2 is already opened (index starts from 0) - the indexes array of the opened facilities say 1 and 3 open, then we need to pass [0,2]
    decision_vars, objective_value = solve_mclp(I, J, s, max_count, cost, budget, v, opened)
    return decision_vars, objective_value

    


