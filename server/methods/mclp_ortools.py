import numpy as np
from ortools.linear_solver import pywraplp as ort
 
# I - the number of the total demand points
# J - the number of the potential facility locations 
# D - The D parameter is a dictionary that indicates whether a demand point i is within the service range of location j
# max_count - the maximum number of facilities that can be opened.
# cost - a list contains each facilities cost to open e.g. cost[n] represents the opening cost for facility index at n
# budget - the maximum budget for open facilities Note: budget = 0 means the budget is unlimited  
# v - a list contains each demand point's value e.g. v[n] represents the value for demand point index at n 
# opened - a list that contains the index of the facilities that are already opened 
# e.g. opened = [0, 10, 25] means faclity 0, 10, and 25 are already opened and they need to be included within solution 
# Return:
#        sites: a Numpy array with shape of (M,2)
def solve_mclp(I, J, D, max_count, cost, budget, v, opened):
    # create a new model
    solver = ort.Solver.CreateSolver('SCIP')

    # add variables
    x = {}
    y = {}

    for i in range(I):
        y[i] = solver.IntVar(0.0, 1.0, 'y%d' % i)
    for j in range(J):
        x[j] = solver.IntVar(0.0, 1.0, 'x%d' % j)


    # Add constraints for max facilities count
    solver.Add(solver.Sum([x[j] for j in range(J)]) <= max_count)

    # facilities that are already opened
    for j in opened:
        solver.Add(x[j] == 1)

    # the distance coverage constraints
    for i in range(I):
        solver.Add(solver.Sum(x[j] for j in np.where(D[i] == 1)[0]) >= y[i])

    # the budget coverage constraint
    if budget > 0:
        solver.Add(solver.Sum(x[j] * cost[j] for j in range(J)) <= budget)

    # Set objective
    solver.Maximize(solver.Sum(y[i] * v[i] for i in range(I)))

    # Solve the model
    status = solver.Solve()

    solution = []
    if status == ort.Solver.OPTIMAL:
        for j in range(J):
            if x[j].solution_value() == 1:
                solution.append(j)
        
        return (solution, solver.Objective().Value())
    else:
        print('Solution not found.')
        return None
    



