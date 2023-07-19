import os
import requests
import json

# Define the URLs
login_url = "http://localhost:5000/login"
data_url = "http://localhost:5000/api/data"

# Check if the token is already saved in environment variables
access_token = os.getenv('BIQ_ACCESS_TOKEN')

# If the token is not found, login to get a new one
if not access_token:
    login_data = {
        "username": "az",
        "password": "psw999"
    }
    login_response = requests.post(login_url, data=json.dumps(login_data), headers={'Content-Type': 'application/json'})

    if login_response.status_code == 200:
        access_token = login_response.json()['access_token']
        # Save the token in an environment variable for later use
        os.environ['BIQ_ACCESS_TOKEN'] = access_token
    else:
        print("Failed to log in")
        exit()

# Now that we have the access token, we can use it to authenticate a request
headers = {
    'Authorization': f'Bearer {access_token}'
}

data_response = requests.get(data_url, headers=headers)

# Check if the request was successful
if data_response.status_code == 200:
    print("Data:", data_response.json())
else:
    print("Failed to get data")