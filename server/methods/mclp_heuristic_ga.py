import random
from deap import base, creator, tools, algorithms
import numpy as np

# Set up problem parameters
I = 1000  # number of demand points
J = 100  # number of candidate facility locations
D = np.random.choice([0, 1], size=(J, I))  # demand coverage
max_count = 5  # maximum number of facilities to open
cost = np.random.uniform(low=1.0, high=100.0, size=J)  # cost to open each facility
budget = 300.0  # budget
v = np.random.uniform(low=1.0, high=10.0, size=I)  # value of each demand point
opened = []  # already opened facilities

creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", list, fitness=creator.FitnessMax)

toolbox = base.Toolbox()

# Attribute generator
toolbox.register("attr_loc", random.randint, 0, J-1)

# Structure initializers
toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr_loc, n=max_count)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)

# The fitness function
def coverage(individual):
    # Ensure we're under budget
    total_cost = sum(cost[loc] for loc in individual if loc not in opened)
    if total_cost > budget:
        return (-1,)  # over-budget solutions are not preferred

    # Calculate coverage
    cover = sum(v[i] for i in range(I) if any(D[loc][i] == 1 for loc in individual))
    return (cover,)

toolbox.register("evaluate", coverage)
toolbox.register("mate", tools.cxTwoPoint)
toolbox.register("mutate", tools.mutUniformInt, low=0, up=J-1, indpb=0.05)
toolbox.register("select", tools.selTournament, tournsize=3)

def main():
    random.seed(64)

    pop = toolbox.population(n=50)
    hof = tools.HallOfFame(1)

    stats = tools.Statistics(lambda ind: ind.fitness.values)
    stats.register("avg", np.mean)
    stats.register("min", np.min)
    stats.register("max", np.max)

    pop, logbook = algorithms.eaSimple(pop, toolbox, cxpb=0.5, mutpb=0.2, ngen=40, 
                                       stats=stats, halloffame=hof, verbose=True)

    return pop, logbook, hof

if __name__ == "__main__":
    main()