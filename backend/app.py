from flask import Flask, request, jsonify, session
from flask_cors import CORS
from db import get_connection
from datetime import datetime
import csv
import hashlib

app = Flask(__name__)
CORS(app)
app.secret_key = 'your_secret_key_here'  # Change this in production

# Mock user database (replace with MySQL integration later)
users = {
    'test@example.com': {
        'password': hashlib.sha256('password123'.encode()).hexdigest(),
        'name': 'Test User',
        'id': 1
    }
}

@app.route("/")
def index():
    return "Backend is running!"

# -------------------- AUTH -------------------- #

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if email in users:
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    user_id = len(users) + 1
    users[email] = {
        'id': user_id,
        'name': name,
        'password': hashed_password
    }

    return jsonify({
        "status": "success",
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    })

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    user = users.get(email)
    if user and user['password'] == hashed_password:
        session['user_id'] = user['id']
        return jsonify({
            "status": "success",
            "user": {
                "id": user['id'],
                "name": user['name'],
                "email": email
            }
        })
    return jsonify({"status": "error", "message": "Invalid credentials"}), 401

# -------------------- TRANSACTIONS -------------------- #

@app.route("/api/add", methods=["POST"])
def add_entry():
    data = request.json
    con = get_connection()
    cur = con.cursor()
    cur.execute("INSERT INTO transactions (date, amount, reason, type) VALUES (%s, %s, %s, %s)",
                (data['date'], data['amount'], data['reason'], data['type']))
    con.commit()
    cur.close()
    con.close()
    return jsonify({"status": "success"})

@app.route("/api/summary", methods=["GET"])
def summary():
    con = get_connection()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT * FROM transactions")
    data = cur.fetchall()
    cur.close()
    con.close()
    return jsonify(data)

@app.route("/api/upload", methods=["POST"])
def upload():
    file = request.files['file']
    con = get_connection()
    cur = con.cursor()
    reader = csv.DictReader(file.stream.read().decode("utf-8").splitlines())
    for row in reader:
        cur.execute("INSERT INTO transactions (date, amount, reason, type) VALUES (%s, %s, %s, %s)",
                    (row['date'], row['amount'], row['reason'], row['type']))
    con.commit()
    cur.close()
    con.close()
    return jsonify({"status": "uploaded"})

@app.route("/api/transactions/<int:transaction_id>/match", methods=["PUT"])
def mark_transaction_matched(transaction_id):
    con = get_connection()
    cur = con.cursor()
    try:
        cur.execute("UPDATE transactions SET matched = TRUE WHERE id = %s", (transaction_id,))
        con.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cur.close()
        con.close()

# -------------------- MAIN -------------------- #

if __name__ == '__main__':
    app.run(debug=True)
