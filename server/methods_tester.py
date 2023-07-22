import os
from methods.mclp_gurobi import get_result

def main():
    demand_file_name = "spatial_units_with_attr.zip"
    data_folder = os.path.join(os.path.dirname(__file__), 'data')
    demand_file_path = os.path.join(data_folder, demand_file_name)

    bb_file_name = "billboards_phx.csv"
    bb_file_path = os.path.join(data_folder, bb_file_name)
    get_result(demand_file_path, bb_file_path)

if __name__ == "__main__":
    main()