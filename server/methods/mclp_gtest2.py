import gurobipy as gp
import numpy as np


# I and J are sets of demand points and potential facility locations, 
# The s parameter is a dictionary that indicates whether a demand point i is within the service range of location j
# The c parameter is the maximum number of facilities that can be opened.
# v representing the value associated with each demand point. 
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
    m.addConstr(gp.quicksum(x[j]*cost[j] for j in range(J)) <= budget, "budget")

    # Optimize model
    m.optimize()
    
    decision_vars = {v.VarName: v.x for v in m.getVars()}
    objective_value = m.objVal

    return decision_vars, objective_value



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
print('Decision Variables:', decision_vars)
print('Objective Value:', objective_value)