import os
import time
from methods.mclp_gurobi import *

def main():
    demand_file_name = "spatial_units_with_attr.zip"
    data_folder = os.path.join(os.path.dirname(__file__), 'data')
    demand_file_path = os.path.join(data_folder, demand_file_name)

    bb_file_name = "billboards_phx_wpricing.csv"
    bb_file_path = os.path.join(data_folder, bb_file_name)

#demand_filepath, bb_filepath, radius, max_count, cost_field, budget, value_field, opened):
    return solve_result_old(demand_file_path, bb_file_path, 3000, 30, "pricingEstPerMo", 30000, 'at_revco', [])


if __name__ == "__main__":
    # Record the start time
    start_time = time.time()
    a, b = main()
    # Record the end time
    end_time = time.time()
    
    print (type(a))
    sum = a['pricingEstPerMo'].sum()

    print('Decision Variables:', a)
    print('Objective Value:', b)
    print ('total cost: ' , sum)

    elapsed_time = end_time - start_time
    elapsed_minutes = int(elapsed_time // 60)  # Use floor division to get whole minutes
    elapsed_seconds = elapsed_time % 60  # Use modulus to get the remaining seconds
    print(f"The function took {elapsed_minutes} minutes and {elapsed_seconds:.2f} seconds to run.")