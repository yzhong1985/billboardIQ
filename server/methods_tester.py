import os
import time
from utilities import solve_result

def main():
    demand_file_name = "spatial_units_with_attr.zip"
    data_folder = os.path.join(os.path.dirname(__file__), 'data')
    demand_file_path = os.path.join(data_folder, demand_file_name)

    bb_file_name = "billboards_phx_wpricing.csv"
    bb_file_path = os.path.join(data_folder, bb_file_name)

    #return solve_result_old(demand_file_path, bb_file_path, 3000, 30, "pricingEstPerMo", 20000, 'at_revco', [])
    return solve_result(demand_file_path, bb_file_path, 3000, 15, "pricingEstPerMo", 20000, 'at_revco', [10,150])

if __name__ == "__main__":
    # Record the start time
    start_time = time.time()
    optimal_billbards, b = main()
    # Record the end time
    end_time = time.time()
    
    sum = optimal_billbards['pricingEstPerMo'].sum()

    print('Decision Variables:\n', optimal_billbards)
    print('Objective Value: ', b)
    print ('total cost: ' , sum)

    elapsed_time = end_time - start_time
    elapsed_minutes = int(elapsed_time // 60)  # Use floor division to get whole minutes
    elapsed_seconds = elapsed_time % 60  # Use modulus to get the remaining seconds
    print(f"The function took {elapsed_minutes} minutes and {elapsed_seconds:.2f} seconds to run.")