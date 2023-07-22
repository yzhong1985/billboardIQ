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
from gurobipy import *
import time


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


def generate_candidate_sites(sites, M=100, heuristic = None):
    '''
    Generate M candidate sites with the convex hull of a point set
    Input:
        sites: a Pandas DataFrame with X, Y and other characteristic
        M: the number of candidate sites to generate
        heuristic: 
    Return:
        sites: a Numpy array with shape of (M,2)
    '''
    if M is not None:
        if M > len(sites):
            M = None
    if heuristic is None or heuristic == '':
        if M is None:
            return sites
        index = np.random.choice(len(sites), M)
        return sites.iloc[index]
    elif heuristic == 'coverage':
        sites = sites.sort_values(by='pop_covered_2km', ascending=False).reset_index()
        if M is None:
            return sites
        return sites.iloc[:M]
    elif heuristic == 'coverage_e':
        sites = sites.sort_values(by='pop_covered_2km_exclusive', ascending=False).reset_index()
        if M is None:
            return sites
        return sites.iloc[:M]
    elif heuristic == 'impression':
        sites = sites.sort_values(by='weeklyImpr', ascending=False).reset_index()
        if M is None:
            return sites
        return sites.iloc[:M]
    elif heuristic == 'impression_e':
        sites = sites.sort_values(by='weeklyImpr_2km_exclusive', ascending=False).reset_index()
        if M is None:
            return sites
        return sites.iloc[:M]


def mclp_gurobi(ls, bbs, current_bbs, K, radius, M, heuristic=''):
    """
    Solve maximum covering location problem
    Input:
        ls: landscan dataset, Pandas DataFrame
        K: the number of sites to select
        radius: the radius of circle
        M: the number of candidate sites
    Return:
        opt_sites: locations K optimal sites, Numpy array in shape of [K,2]
        f: the optimal value of the objective function
    """

    """
    print('----- Configurations -----')
    print('Number of points %g' % len(ls))
    print('Number of billboards %g' % len(bbs))
    print('Number of current billboards %g' % len(current_bbs))
    print('Number of selected billboards - K %g' % K)
    print('Billboard coverage Radius %g (Meter)' % radius)
    print('Number of candidate billboard sampled - M %g' % M)
    """

    bbs_ = generate_candidate_sites(bbs, M, heuristic)

    value_field = 'at_revco'
    ls['easting'] = ls.geometry.x
    ls['northing'] = ls.geometry.y
    
    current_bbs = pd.DataFrame(current_bbs, columns=['POINT_X','POINT_Y'])
    current_bbs['current'] = True
    bbs_.loc['current'] = False
    bbs = current_bbs.append(bbs_, ignore_index=True, verify_integrity=True)
    bbs = bbs.reset_index()

    J = len(bbs)  # indexing for facility sites
    I = len(ls)  # indexing for population (clients)
    D = distance_matrix_binary(ls[['easting', 'northing']].values, bbs[['POINT_X', 'POINT_Y']].values, radius)

    pop = ls[value_field]
    start = time.time()

    # Build model
    m = Model()

    # Add variables
    x = {}
    y = {}

    current = len(current_bbs)

    for i in range(I):
        y[i] = m.addVar(vtype=GRB.BINARY, name='y%d' % i)

    for j in range(J):
        x[j] = m.addVar(vtype=GRB.BINARY, name='x%d' % j)

    m.update()

    # Add constraints
    m.addConstr(quicksum(x[j] for j in range(J)) == K)

    for j in range(current):
        m.addConstr(x[j] == 1)

    for i in range(I):
        m.addConstr(quicksum(x[j] for j in np.where(D[i] == 1)[0])
                    >= y[i])

    m.setObjective(quicksum(y[i] * pop[i] for i in range(I)),
                   GRB.MAXIMIZE)

    m.setParam('OutputFlag', 0)
    m.optimize()
    end = time.time()

    """
    # print('----- Output -----')
    print('  Running time : %s seconds' % float(end-start))
    print('  Optimal coverage points: %g' % m.objVal)
    """

    solution = []
    if m.status == GRB.Status.OPTIMAL:
        for v in m.getVars():
            if v.x == 1 and v.varName[0] == 'x':
                solution.append(int(v.varName[1:]))

    opt_bbs = bbs.iloc[solution]
    return (opt_bbs, m.objVal)


def get_result(demand_filepath, bb_filepath):
    ls = gpd.read_file(demand_filepath)
    sitedf = pd.read_csv(bb_filepath)
    sites = np.array(sitedf[['POINT_X', 'POINT_Y']], dtype=np.float64)

    K = 30

    # Service radius of each site
    radius = 3000

    # Heuristic
    heuristic = ''

    # Candidate site size (random sites generated)
    M = len(ls)

    current_sites = []
    # Run mclp opt_sites is the location of optimal sites and f is the points covered
    opt_sites, n_coverage = mclp_gurobi(ls, sitedf, current_sites, K, radius, M, heuristic)

    jsonStr = opt_sites[['index','lat','long','heading','productTyp','weeklyImpr']].to_json()
    print(jsonStr)
    