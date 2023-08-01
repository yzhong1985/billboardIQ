import os
from google.oauth2 import id_token
from google.auth.transport import requests
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_cors import CORS, cross_origin

app = Flask(__name__)
jwt = JWTManager(app)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3000/login'])  # Enable CORS for the entire app

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

    # Usually, you should verify the user information from database
    # Here we assume if the user sends correct username 'test' and password 'test', we'll authenticate them
    if username != 'az' or password != 'psw999':
        return jsonify({"msg": "Bad username or password"}), 401

    # If the above check passes, we'll create a new access token and return it to the user
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200


@app.route('/api/data', methods=['GET'])
@jwt_required()  # This route now requires a valid access token in the header
def get_data():
    data = {
        "name": "John Doe",
        "age": 30,
        "occupation": "Engineer"
    }
    return jsonify(data)


# Define the route for fetching GeoJSON data
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

@app.route('/api/billboards', methods=['POST'])
def get_billboards():
    try:
        # Get the parameters from the request body
        data = request.get_json()
        file_path = data.get('file_path')
        method = data.get('method')

        if not file_path or not mode:
            return jsonify({"error": "Invalid request parameters."}), 400

        # Construct the absolute file path to the GeoJSON file
        file_path = os.path.join(os.getcwd(), file_path)
        
        with open(file_path, 'r') as file:
            geojson_data = file.read()
            # Process the mode parameter based on your needs
            if mode == 1:
                # Process data in mode 1
                processed_data = process_mode_one(geojson_data)
                return jsonify(processed_data)
            elif mode == 2:
                # Process data in mode 2
                processed_data = process_mode_two(geojson_data)
                return jsonify(processed_data)
            else:
                return jsonify({"error": "Invalid mode parameter."}), 400

    except FileNotFoundError:
        return jsonify({"error": "GeoJSON file not found."}), 404

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
        # print("access_token: " + access_token)
        return { "message": "Success", "email" : email, "given_name" : given_name, "family_name" : family_name, "picture" : picture, "access_token" : access_token }
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"err": "err from server"}

if __name__ == '__main__':
    app.run(debug=True)