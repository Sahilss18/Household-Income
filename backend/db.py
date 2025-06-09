# backend/db.py
import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='Resets18&',  
        database='tracker_db'     
    )
