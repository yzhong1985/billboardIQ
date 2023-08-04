import numpy as np
import pandas as pd
import geopandas as gpd
import importlib

# the actual function to solve the result
def get_optimal_billboards(demand_filepath, bb_filepath, radius, max_count, cost_field, budget, value_field, opened, method_module):
    try:
        # read from demand file and facilities file
        demand_ls = gpd.read_file(demand_filepath)
        billboards_ls = pd.read_csv(bb_filepath)

        demand_ls['easting'] = demand_ls.geometry.x
        demand_ls['northing'] = demand_ls.geometry.y
        I = len(demand_ls)
        J = len(billboards_ls)
        demand_pts = np.asarray(demand_ls[['easting', 'northing']].values)
        facility_pts = np.asarray(billboards_ls[['POINT_X', 'POINT_Y']].values)
        s = cal_coverage_matrix(demand_pts, facility_pts, radius)
        # pricing array of the billboard
        cost = billboards_ls[cost_field]
        # demand value array of the demand pts
        #v = demand_ls[value_field]
        field_array = [(value_field, 1)]
        v = cal_demand_series(demand_ls, field_array)
        mclp_module = importlib.import_module(method_module)

        opt_billboards, total_covered_val = mclp_module.solve_mclp(I, J, s, max_count, cost, budget, v, opened)
        billboards = billboards_ls.iloc[opt_billboards]

        return billboards, total_covered_val

    except ImportError:
        #print(f"No module named {module_name} exists")
        return None
    except AttributeError:
        #print(f"Module {module_name} does not have a function named 'method'")
        return None
    except Exception as e:
        print("An error occurred: ", e)
        return None

def cal_coverage_matrix(demand_pts, facility_pts, facility_radius):
    """
    Calculate the coverage of each demand point by each facility point.

    Parameters:
    demand_pts (numpy.ndarray): A N*2 array of [x, y] coordinates for the demand points.
    facility_pts (numpy.ndarray): A M*2 array of [x, y] coordinates for the facility points.
    facility_radius (numpy.ndarray or float or int): A scalar or 1D array representing the coverage radius for each facility point.

    Returns:
    numpy.ndarray: A [N, M] boolean array. An element at [i, j] is True if the demand point at index i is within the
    coverage radius of the facility point at index j, and False otherwise.
    """

    # Subtract the demand points from the facility points in a broadcasted manner
    # This will give a [M, N, 2] array where the last dimension contains the x and y differences
    differences = facility_pts[:, np.newaxis] - demand_pts

    # Calculate the square of the Euclidean distance.
    # This will give a [M, N] array where each element is the square of the distance from a facility point to a demand point
    sq_distances = np.sum(differences ** 2, axis=-1)

    # Take the square root to get the actual distances
    distances = np.sqrt(sq_distances)

    # Check if facility_radius is a numpy array. If it is, use broadcasting. Otherwise, use it as a scalar.
    if isinstance(facility_radius, np.ndarray):
        coverage = distances <= facility_radius[:, np.newaxis]
    else:
        coverage = distances <= facility_radius

    # Since the requirement is for an [N, M] array, transpose the result
    return coverage.T

def cal_demand_series(df, field_array):
    """
    This function calculates the linear combination of specified fields in the dataframe
    with corresponding coefficients and returns the results as a pandas Series.

    Parameters:
    df (pandas.DataFrame): The input dataframe which contains the fields for calculation.
    field_array (list of tuple): Each tuple contains a string and a numeric value. 
                                  The string is a field name in 'df' and the numeric value 
                                  is the coefficient for this field in the calculation.

    Returns:
    result_series (pandas.Series): The result of the calculation for each row in 'df'.
                                   Each entry in the series corresponds to a row in 'df',
                                   and the entry value is the calculation result for this row.
    """
    result_series = pd.Series(0, index=df.index) # initialize new series to store the results
    for field, coefficient in field_array:
        if field in df.columns:
            result_series += df[field] * coefficient
    return result_series


# delete after use
def test():
    try:# read from demand file and facilities file
        df = pd.DataFrame({
            'field1': [1, 2, 3],
            'field2': [4, 5, 6],
            'field3': [7, 8, 9],
        })

        field_array = [('field1', 0.1), ('field2', 0.2), ('field3', 0.3)]

        new_series = cal_demand_series(df, field_array)
        print(new_series)
        return None
    except Exception as e:
        print("An error occurred: ", e)
        return None
        
