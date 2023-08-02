import heapq
import numpy as np
from multiprocessing import Pool

def calculate_ratio(args):
    j, cost_j, D_j, v = args
    value = np.sum(D_j*v)
    ratio = value / cost_j
    return ratio, j

def greedy_mclp(I, J, D, max_count, cost, budget, v, opened):
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