import numpy as np
import gurobipy as gp
 
def solve_mclp(I, J, D, max_count, cost, budget, v, opened):
    """
    The method makes use of the Gurobi Optimizer to solve the maximal covering location problem (MCLP). 
    The MCLP can be transformed into a mixed-integer linear programming (MILP) problem, which can be 
    effectively solved using Solvers. 
    
    Gurobipy must be installed in order to use this method. To install, use the command line to execute 
    'pip install gurobipy'. gurobipy must be activated with a license. The free Acdemic license can be 
    obtained from Gurobi's website, please follow the activation instructions provided on their website.
    
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
    m = gp.Model("mclp_solver")

    # add variables
    x = {}
    y = {}

    for i in range(I):
        y[i] = m.addVar(vtype=gp.GRB.BINARY, name='y%d' % i)

    for j in range(J):
        x[j] = m.addVar(vtype=gp.GRB.BINARY, name='x%d' % j)

    # add constraints for max facilities count
    m.addConstr(gp.quicksum(x[j] for j in range(J)) <= max_count)

    # facilities that are already opened
    for j in opened:
        m.addConstr(x[j] == 1)

    # the distance coverage constraints
    for i in range(I):
        m.addConstr(gp.quicksum(x[j] for j in np.where(D[i] == 1)[0]) >= y[i])

    # the budget coverage constraint
    if budget > 0:
        m.addConstr(gp.quicksum(x[j] * cost[j] for j in range(J)) <= budget)

    m.setObjective(gp.quicksum(y[i] * v[i] for i in range(I)), gp.GRB.MAXIMIZE)
 
    # Optimize model
    m.optimize()
    solution = []
    if m.status == gp.GRB.Status.OPTIMAL:
        for v in m.getVars():
            if v.x == 1 and v.varName[0] == 'x':
                solution.append(int(v.varName[1:]))
        return (solution, m.objVal)
    else:
        print('Solution not found.')
        return None
    

