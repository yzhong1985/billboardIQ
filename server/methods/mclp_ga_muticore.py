import random
from deap import base, creator, tools, algorithms
from multiprocessing import Pool

# The fitness function
def coverage(individual, I, D, cost, budget, v, opened):
    # Ensure we're under budget
    total_cost = sum(cost[loc] for loc in individual if loc not in opened)
    if total_cost > budget:
        return (-1,)  # over-budget solutions are not preferred

    # Calculate coverage
    cover = sum(v[i] for i in range(I) if any(D[i][loc] == 1 for loc in individual + opened))
    return (cover,)

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

    # Register the fitness function
    toolbox.register("evaluate", coverage, I=I, D=D, cost=cost, budget=budget, v=v, opened=opened)
    toolbox.register("mate", tools.cxTwoPoint)
    toolbox.register("mutate", tools.mutUniformInt, low=0, up=J-1, indpb=0.05)
    toolbox.register("select", tools.selTournament, tournsize=3)

    # Parallelization
    pool = Pool()
    toolbox.register("map", pool.map)

    # Set seed
    random.seed(64)

    # Initialize population
    pop = toolbox.population(n=50)

    # Track the best individual
    hof = tools.HallOfFame(1)

    # Run the algorithm
    pop, log = algorithms.eaSimple(pop, toolbox, cxpb=0.5, mutpb=0.2, ngen=40, halloffame=hof, verbose=False)

    # Add opened facilities to the chosen ones and calculate total coverage
    chosen_facilities = hof[0] + opened
    total_coverage = coverage(chosen_facilities, I, D, cost, budget, v, opened)[0]

    # Close the pool and wait for the worker processes to exit
    pool.close()
    pool.join()

    # Return the index of the chosen facilities and the total coverage value
    return chosen_facilities, total_coverage

def solve_mclp_wprogress(I, J, D, max_count, cost, budget, v, opened):
    # Create types
    creator.create("FitnessMax", base.Fitness, weights=(1.0,))
    creator.create("Individual", list, fitness=creator.FitnessMax)

    toolbox = base.Toolbox()

    # Attribute generator
    toolbox.register("attr_loc", random.randint, 0, J-1)

    # Structure initializers
    toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr_loc, n=max_count-len(opened))
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)

    # Register the fitness function
    toolbox.register("evaluate", coverage, I=I, D=D, cost=cost, budget=budget, v=v, opened=opened)
    toolbox.register("mate", tools.cxTwoPoint)
    toolbox.register("mutate", tools.mutUniformInt, low=0, up=J-1, indpb=0.05)
    toolbox.register("select", tools.selTournament, tournsize=3)

    # Parallelization
    pool = Pool()
    toolbox.register("map", pool.map)

    # Set seed
    random.seed(64)

    # Initialize population
    pop = toolbox.population(n=50)

    # Track the best individual
    hof = tools.HallOfFame(1)

    # Customized evolutionary algorithm
    CXPB, MUTPB, NGEN = 0.5, 0.2, 40

    # Evaluate the entire population
    fitnesses = list(toolbox.map(toolbox.evaluate, pop))
    for ind, fit in zip(pop, fitnesses):
        ind.fitness.values = fit

    for g in range(NGEN):
        print("-- Generation %i --" % g)

        # Select the next generation individuals
        offspring = toolbox.select(pop, len(pop))
        # Clone the selected individuals
        offspring = list(toolbox.map(toolbox.clone, offspring))

        # Apply crossover and mutation on the offspring
        for child1, child2 in zip(offspring[::2], offspring[1::2]):
            if random.random() < CXPB:
                toolbox.mate(child1, child2)
                del child1.fitness.values
                del child2.fitness.values

        for mutant in offspring:
            if random.random() < MUTPB:
                toolbox.mutate(mutant)
                del mutant.fitness.values

        # Evaluate the individuals with an invalid fitness
        invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
        fitnesses = toolbox.map(toolbox.evaluate, invalid_ind)
        for ind, fit in zip(invalid_ind, fitnesses):
            ind.fitness.values = fit

        # Replace population
        pop[:] = offspring

        # Update Hall of Fame
        hof.update(pop)

        # Print best coverage so far
        print("Best coverage so far: ", hof[0].fitness.values[0])

    print("-- End of (successful) evolution --")

    # Add opened facilities to the chosen ones and calculate total coverage
    chosen_facilities = hof[0] + opened
    total_coverage = coverage(chosen_facilities, I, D, cost, budget, v, opened)[0]

    # Close the pool and wait for the worker processes to exit
    pool.close()
    pool.join()

    # Return the index of the chosen facilities and the total coverage value
    return chosen_facilities, total_coverage