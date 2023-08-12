from flask import Blueprint, jsonify

login_routes = Blueprint('login', __name__)

@login_routes.route('/')
def list_users():
    return jsonify(["John", "Jane", "Doe"])

@login_routes.route('/<int:user_id>')
def get_user(user_id):
    return jsonify({"id": user_id, "name": "John"})