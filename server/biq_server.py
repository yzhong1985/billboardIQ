import os
import time
from google.oauth2 import id_token
from google.auth.transport import requests
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_cors import CORS, cross_origin
import threading
from utilities import get_optimal_billboards

from pymongo import MongoClient
from bson.objectid import ObjectId
from config import *

client = MongoClient(ATLAS_URI)
db = client[DB_NAME]

app = Flask(__name__)
jwt = JWTManager(app)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3000/login'])  # Enable CORS for the entire app
semaphore = threading.Semaphore(1)

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = "c955f7202fd44c5db84464af36551727"  # set a key
CLIENT_ID = '273471213430-2vufnmj5gfuok2hseihdl0cjcf391ev5.apps.googleusercontent.com' 

@app.route('/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    if not username:
        return jsonify({"msg": "Missing username parameter"}), 400
    if not password:
        return jsonify({"msg": "Missing password parameter"}), 400
    if username != 'az' or password != 'psw999':
        return jsonify({"msg": "Bad username or password"}), 401
    # If the above check passes, we'll create a new access token and return it to the user
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200


# fetching workspace
@app.route('/workspace/<userid>', methods=['GET'])
def get_workspaces(userid):
    obj_id = ObjectId(userid)
    user = db.users.find_one({"_id": obj_id})   
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    workspaces = list(db.workspaces.find({"_id": {"$in": user['workspaces']}}))   
    # Convert ObjectId to string for JSON serialization
    for workspace in workspaces:
        workspace["_id"] = str(workspace["_id"])
    
    return jsonify(workspaces)


@app.route('/api/data', methods=['GET'])
@jwt_required()  # This route now requires a valid access token in the header
def get_data():
    data = {
        "name": "John Doe",
        "age": 30,
        "occupation": "Engineer"
    }
    return jsonify(data)


# testing for fetching GeoJSON data
@app.route('/api/geojson', methods=['GET'])
def get_geojson_data():
    try:
        # Get the absolute path to the GeoJSON file
        file_path = os.path.join(os.path.dirname(__file__), 'data', 'sample.geojson')
        with open(file_path, 'r') as file:
            geojson_data = file.read()
            return jsonify(geojson_data)
    except FileNotFoundError:
        return jsonify({"error": "GeoJSON file not found."}), 404

# the main endpoint to calculate optimal billboards
@app.route('/api/billboards', methods=['POST'])
def get_billboards():
    with semaphore:
        try:
            data = request.get_json()
            print("request data:")
            print(data)  
            radius = data.get("radius", 3000)
            max_num_billboards = data.get("max_bb_num", 20)
            cost_field = data.get("bb_pricing_field", "pricingEstPerMo")
            max_cost = data.get("max_total_cost", 40000)
            demand_field = data.get("demand_field", "at_revco")
            existing_bb = []
            method_module = data.get("method", "solver.sp_gurobi")

            demand_file_name = "phx_spatial_units.zip"
            data_folder = os.path.join(os.path.dirname(__file__), 'data')
            demand_file_path = os.path.join(data_folder, demand_file_name)
            bb_file_name = "billboards_phx_wpricing.csv"
            bb_file_path = os.path.join(data_folder, bb_file_name)

            # parameters
            #radius = 3000
            #max_num_billboards = 20
            #cost_field = "pricingEstPerMo"
            #max_cost = 40000
            #demand_field = "at_revco"
            #existing_bb = [10, 150] 
            #method_module = "solver.sp_ortools"
            #method_module = "solver.sp_gurobi"
            #method_module = "solver.sp_cplex"
            #method_module = "heuristic.sp_sa"
            start_time = time.time()
            billboards, covered_val = get_optimal_billboards(demand_file_path, bb_file_path, radius, max_num_billboards, cost_field, max_cost, demand_field, existing_bb, method_module)
            end_time = time.time()
            elapsed_time = end_time - start_time
            resultData = {
                "billbards": billboards.to_json(orient="records"),
                "coveredVal": covered_val,
                "elapsedTime": elapsed_time
            }
            return jsonify(resultData)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        

# test post
@app.route('/posttest', methods=['POST'])
def post_test():
    try:
        print(f"1")
        data = request.json
        name = data.get('name', '')
        email = data.get('email', '')
        token = data.get('token', '')
        print(f"Received data - Name: {name}, Email: {email}")
        print("Token:" + token)
        return {"message": "Data received successfully!"}
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': 'test'}), 400


# Use google token to verify
@app.route('/tokensignin', methods=['POST'])
def token_sign_in():
    try:
        data = request.json
        token = data.get('token', '')
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        userid = idinfo['sub']
        email = idinfo['email']
        picture = idinfo['picture']
        given_name = idinfo['given_name']
        family_name = idinfo['family_name']
        access_token = create_access_token(identity=userid)
        
        # check database see if the user with this google account already exisit
        user = db.users.find_one({"email": email}) 
        if not user:
            return jsonify({"error": "User not found"}), 404

        return { "message": "Success", "userid": str(user["_id"]), "email" : email, "given_name" : given_name, "family_name" : family_name, "picture" : picture, "access_token" : access_token }
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"err": "err from server"}

if __name__ == '__main__':
    app.run(debug=True)