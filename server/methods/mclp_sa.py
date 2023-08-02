import numpy as np
import random

# Constants for the simulated annealing
initial_temperature = 1000  
alpha = 0.99
num_iterations = 1500

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

def solve_mclp(I, J, D, max_count, cost, budget, v, opened):
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
        if iteration % 100 == 0:
            print(f"Iteration {iteration}: current fitness is {old_fitness}")

        # Cool down
        current_temperature *= alpha

    # Calculate final covered value
    _, covered_value = calculate_fitness(selected, D, cost, v, budget, opened, coverage)

    print("Best solution found covers value of", covered_value)
    return selected, covered_value