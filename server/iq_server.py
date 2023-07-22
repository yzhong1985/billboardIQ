import os
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = "c955f7202fd44c5db84464af36551727"  # set a key

jwt = JWTManager(app)

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





if __name__ == '__main__':
    app.run(debug=True)