import numpy as np
import random

def precompute_coverage(D):
    coverage = [set() for _ in range(D.shape[0])]
    for i in range(D.shape[0]):
        for j in range(D.shape[1]):
            if D[i, j] == 1:
                coverage[i].add(j)
    return coverage

def calculate_fitness(selected, D, cost, v, budget, opened, coverage):
    # check if it exceeds the budget
    if sum(cost[selected]) > budget:
        return -1, 0  # Invalid solution, zero coverage

    # Add up the value of all covered points
    selected_set = set(selected)
    covered_value = sum(v[i] for i in range(len(coverage)) if coverage[i] & selected_set)
    return covered_value, covered_value

def solve_mclp(I, J, D, max_count, cost, budget, v, opened, initial_temperature=1000, alpha=0.99, num_iterations=1500, showInfo=True):
    """
    The method makes use of the Simulated Annealing to solve the maximal covering location problem (MCLP).
    Simulated Annealing (SA) is a heuristic method used for finding good (not necessarily perfect) 
    solutions to an optimization problem such as MCLP. Its name comes from a process in metallurgy 
    called annealing, where a material (like glass or metal) is heated and then slowly cooled to reduce 
    its defects and increase its strength.

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

    if showInfo:
        print("Simulated Annealing (SA) algorithm is used to solve MCLP")
        print("-- SA parameters --")
        print(f"initial temperature = {initial_temperature}")
        print(f"alpha (cooling rate) = {alpha}")
        print(f"num of iterations = {num_iterations}")
              
    # Precompute coverage
    coverage = precompute_coverage(D)

    # Initialize solution: include the already opened facilities
    selected = list(opened)
    # Select random facilities until max_count
    while len(selected) < max_count:
        candidate = random.randint(0, J-1)
        if candidate not in selected:
            selected.append(candidate)

    # Simulated Annealing main loop
    current_temperature = initial_temperature
    for iteration in range(num_iterations):
        # Generate new candidate solution
        new_selected = list(selected)
        # Randomly replace a facility with a not yet selected one
        not_selected = [j for j in range(J) if j not in new_selected and j not in opened]
        if not_selected:  # Only proceed if there are facilities to select
            replace_index = random.randint(0, len(new_selected)-1)
            # Ensure not to replace the already opened facilities
            while replace_index < len(opened):
                replace_index = random.randint(0, len(new_selected)-1)
            new_selected[replace_index] = random.choice(not_selected)

        # Decide whether to accept new solution
        old_fitness, _ = calculate_fitness(selected, D, cost, v, budget, opened, coverage)
        new_fitness, new_covered_value = calculate_fitness(new_selected, D, cost, v, budget, opened, coverage)
        if new_fitness > old_fitness or np.random.rand() < np.exp((new_fitness - old_fitness) / current_temperature):
            selected = new_selected

        # Print progress
        if (showInfo and iteration % 100 == 0):
            print(f"Iteration {iteration}: current fitness is {old_fitness}")

        # Cool down
        current_temperature *= alpha

    # Calculate final covered value
    _, covered_value = calculate_fitness(selected, D, cost, v, budget, opened, coverage)

    if showInfo:
        print("Best solution found covers value of", covered_value)

    return selected, covered_value