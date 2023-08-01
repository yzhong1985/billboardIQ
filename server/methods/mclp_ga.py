import random
from deap import base, creator, tools, algorithms

# I - the number of the total demand points
# J - the number of the potential facility locations 
# D - The D parameter is a dictionary that indicates whether a demand point i is within the service range of location j
# max_count - the maximum number of facilities that can be opened.
# cost - a list contains each facilities cost to open e.g. cost[n] represents the opening cost for facility index at n
# budget - the maximum budget for open facilities Note: budget = 0 means the budget is unlimited  
# v - a list contains each demand point's value e.g. v[n] represents the value for demand point index at n 
# opened - a list that contains the index of the facilities that are already opened 
# e.g. opened = [0, 10, 25] means faclity 0, 10, and 25 are already opened and they need to be included within solution 
def solve_mclp(I, J, D, max_count, cost, budget, v, opened):
    # Create types
    creator.create("FitnessMax", base.Fitness, weights=(1.0,))
    creator.create("Individual", list, fitness=creator.FitnessMax)

    toolbox = base.Toolbox()

    # Attribute generator
    toolbox.register("attr_loc", random.randint, 0, J-1)

    # Structure initializers
    toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr_loc, n=max_count-len(opened))
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)

    # The fitness function
    def coverage(individual):
        # Ensure we're under budget
        total_cost = sum(cost[loc] for loc in individual if loc not in opened)
        if total_cost > budget:
            return (-1,)  # over-budget solutions are not preferred

        # Calculate coverage
        cover = sum(v[i] for i in range(I) if any(D[i][loc] == 1 for loc in individual + opened))
        return (cover,)

    toolbox.register("evaluate", coverage)
    toolbox.register("mate", tools.cxTwoPoint)
    toolbox.register("mutate", tools.mutUniformInt, low=0, up=J-1, indpb=0.05)
    toolbox.register("select", tools.selTournament, tournsize=3)

    # Set seed
    random.seed(64)

    # Initialize population
    pop = toolbox.population(n=50)

    # Track the best individual
    hof = tools.HallOfFame(1)

    # Run the algorithm
    pop, log = algorithms.eaSimple(pop, toolbox, cxpb=0.5, mutpb=0.2, ngen=40, halloffame=hof, verbose=False)

    chosen_facilities = hof[0] + opened
    total_coverage = coverage(chosen_facilities)[0]

    # Return the index of the chosen facilities and the total coverage value
    return chosen_facilities, total_coverage
