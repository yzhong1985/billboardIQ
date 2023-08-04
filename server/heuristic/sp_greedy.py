import heapq
import numpy as np
from multiprocessing import Pool

def calculate_ratio(args):
    j, cost_j, D_j, v = args
    value = np.sum(D_j*v)
    ratio = value / cost_j
    return ratio, j

def greedy_mclp_multi(I, J, D, max_count, cost, budget, v, opened):
    solution = opened[:]
    budget_used = sum(cost[i] for i in opened)
    D = np.array(D)
    v = np.array(v)
    cost = np.array(cost)

    # Initially, all facilities are candidates
    candidates = list(range(J))

    with Pool() as p:
        while len(solution) < max_count and budget_used < budget:
            args_list = [(j, cost[j], D[:, j], v) for j in candidates]
            ratios_and_facilities = p.map(calculate_ratio, args_list)
            heapq._heapify_max(ratios_and_facilities)  # Convert list to max heap

            while ratios_and_facilities:
                ratio, facility = heapq._heappop_max(ratios_and_facilities)  # Pop facility with max ratio
                solution.append(facility)
                budget_used += cost[facility]

                # Update candidates: remove added facility and facilities that would exceed the budget
                candidates = [j for j in candidates if j != facility and cost[j] + budget_used <= budget]
                if candidates:
                    break

    # Keep track of covered points
    covered_points = np.zeros(I)
    total_value = 0
    for j in solution:
        points_covered_by_j = np.where(D[:, j] == 1)[0]
        new_points_covered_by_j = points_covered_by_j[np.where(covered_points[points_covered_by_j] == 0)[0]]
        total_value += np.sum(v[new_points_covered_by_j])
        covered_points[new_points_covered_by_j] = 1  # Mark points as covered

    return solution, total_value

def greedy_mclp(I, J, D, max_count, cost, budget, v, opened):
    # Initialize the solution with already opened facilities
    solution = opened[:]
    budget_used = sum(cost[i] for i in opened)

    while len(solution) < max_count and budget_used < budget:
        best_ratio = -1  # Negative, as we want to maximize this value
        best_facility = None

        for j in range(J):  # For each facility
            # If this facility is already in the solution or it's too expensive, skip
            if j in solution or cost[j] + budget_used > budget:
                continue

            # Value of this facility
            value = 0

            for i in range(I):  # For each demand point
                if D[i][j] == 1:  # If this point is within the radius of facility
                    value += v[i]  # Add the value of this point to the total value

            # Value/Cost ratio of this facility
            ratio = value / cost[j]

            # If this facility provides a better value/cost ratio
            if ratio > best_ratio:
                # Update best ratio and best facility
                best_ratio = ratio
                best_facility = j

        # If we didn't find any facility to add, break the loop
        if best_facility is None:
            break

        # Add the best facility to the solution and update budget_used
        solution.append(best_facility)
        budget_used += cost[best_facility]

    # Keep track of covered points
    covered_points = [0]*I
    total_value = 0
    for j in solution:
        for i in range(I):
            if D[i][j] == 1 and covered_points[i] == 0:
                total_value += v[i]
                covered_points[i] = 1  # Mark point as covered

    return solution, total_value