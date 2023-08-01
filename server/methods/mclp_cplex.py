import numpy as np
from docplex.mp.model import Model
from docplex.util.status import JobSolveStatus
 
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
    # Create a new model
    m = Model(name='MCLP')

    # add variables
    x = m.binary_var_dict(range(J), name='x')
    y = m.binary_var_dict(range(I), name='y')

    # max count of the facilities to be selected
    m.add_constraint(m.sum(x[j] for j in range(J)) <= max_count)

    # facilities that are already opened
    for j in opened:
        m.add_constraint(x[j] == 1)
    
    # the distance coverage constraints
    for i in range(I):
        m.add_constraint(m.sum(x[j] for j in np.where(D[i] == 1)[0]) >= y[i])

    # add constraint for the budget
    if budget > 0:
        m.add_constraint(m.sum(x[j] * cost[j] for j in range(J)) <= budget)

    # set objective function
    m.maximize(m.sum(y[i] * v[i] for i in range(I)))

    # solve the model
    solution = []
    m.solve()


    if m.get_solve_status() == JobSolveStatus.OPTIMAL_SOLUTION:
        for j in range(J):
            if x[j].solution_value > 0.5:
                solution.append(j)
        return (solution, m.solution.get_objective_value())
    else:
        print('optimal solution not found.')
        return None
    