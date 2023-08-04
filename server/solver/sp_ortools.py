import numpy as np
from ortools.linear_solver import pywraplp as ort
 
def solve_mclp(I, J, D, max_count, cost, budget, v, opened):
    """
    The method makes use of the OR-Tools to solve the maximal covering location problem (MCLP). 
    The MCLP can be transformed into a mixed-integer linear programming (MIP) problem, which can be 
    effectively solved using Solvers. OR-Tools is an open source software suite developed by Google 
    for solving linear programming (LP), mixed integer programming (MIP), constraint programming (CP), 
    vehicle routing (VRP), and related optimization problems. OR-Tools are open source software under 
    the Apache License, which allows free reuse for commercial purposes
    
    Ortools must be installed in order to use this method. To install, use the command line to execute 
    'pip install ortools'. Module 'pywraplp' needs to be imported
    
    Args:
        I (int): the number of the total demand points
        J (int): the number of the potential facility locations 
        D (array): the array [I, J], it indicates whether a demand point i is within 
            the service range of location j
        max_count (int): the maximum number of facilities that can be opened.
        cost (list): a list contains each facility's opening costs
            e.g. cost[n] represents the opening cost for facility index at n
        budget (int): the maximum budget for open facilities 
            note: budget = 0 means the budget is unlimited  
        v (list): a list contains each demand point's value 
            e.g. v[n] represents the value for demand point index at n 
        opened (list): a list that comprises the indexes of the existing facilities
            e.g. opened = [0, 10, 25] indicates that facilities 0, 10, and 25 are already 
            open and must be included inside the solution. 

    Returns:
        tuple: A tuple containing a list and a value 
            a list containing all of the indexes of the selected facilities   
            A numerical number represents the final objective value covered
    """

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
    



