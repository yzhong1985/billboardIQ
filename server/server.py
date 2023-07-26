from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

@app.route('/submit', methods=['POST'])
def receive_data():
    data = request.json
    name = data.get('name', '')
    email = data.get('email', '')
    
    print(f"Received data - Name: {name}, Email: {email}")
    
    return {"message": "Data received successfully!"}

if __name__ == '__main__':
    app.run(debug=True)