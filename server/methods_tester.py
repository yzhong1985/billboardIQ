import os
import time
from utilities import get_optimal_billboards

def main():

    demand_file_name = "spatial_units_with_attr.zip"
    data_folder = os.path.join(os.path.dirname(__file__), 'data')
    demand_file_path = os.path.join(data_folder, demand_file_name)
    bb_file_name = "billboards_phx_wpricing.csv"
    bb_file_path = os.path.join(data_folder, bb_file_name)

    # Parameters
    radius = 3000
    max_num_billboards = 30
    cost_field = "pricingEstPerMo"
    max_cost = 40000
    demand_field = "at_revco"
    existing_bb = [10, 150]
    #method_module = "solver.sp_ortools"
    #method_module = "solver.sp_gurobi"
    #method_module = "solver.sp_cplex"
    method_module = "heuristic.sp_sa"

    return get_optimal_billboards(demand_file_path, bb_file_path, radius, max_num_billboards, cost_field, max_cost, demand_field, existing_bb, method_module)
    #test(demand_file_path, bb_file_path, 3000)

if __name__ == "__main__":
    
    start_time = time.time()
    optimal_billbards, covered_val = main()
    total_cost = optimal_billbards['pricingEstPerMo'].sum()
    print('Decision Variables:\n', optimal_billbards)
    print('Objective Value: ', covered_val)
    print ('total cost: ' , total_cost)

    end_time = time.time()
    elapsed_time = end_time - start_time
    elapsed_minutes = int(elapsed_time // 60)  # Use floor division to get whole minutes
    elapsed_seconds = elapsed_time % 60  # Use modulus to get the remaining seconds
    print(f"The function took {elapsed_minutes} minutes and {elapsed_seconds:.2f} seconds to run.")

    