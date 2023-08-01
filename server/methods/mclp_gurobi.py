import numpy as np
import gurobipy as gp
 
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
    
    

def printTypes(I, J, D, max_count, cost, budget, v, opened):
    print("I - " + str(type(I)))
    print("J - " + str(type(J)))
    print("D - " + str(type(D)))
    print("max_count - " + str(type(max_count)))
    print("cost - " + str(type(cost)))
    print("budget - " + str(type(budget)))
    print("v - " + str(type(v)))
    print("opened - " + str(type(opened)))
    return

