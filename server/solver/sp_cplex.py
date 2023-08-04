import numpy as np
from docplex.mp.model import Model
from docplex.util.status import JobSolveStatus
 
def solve_mclp(I, J, D, max_count, cost, budget, v, opened):
    """
    To use this method, IBM ILOG CPLEX Optimization Studio must be installed on the computer.
    Keep in mind that the software only supports Python 3.10 as of right now (2023.08.01),
    Please consult IBM for instructions on installing the Cplex Python API if Python 3.11 or above is installed. 
    Run the Python setup.py install file in the install folder once the studio has been installed. 
    then the docplex package can be used to access the API (which will be installed by the setup.py script).

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
    