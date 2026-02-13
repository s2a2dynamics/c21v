import os
import mysql.connector
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="C21V DB Explorer")

DB_CONFIG = {
    "host": "genioi.cmccfp1q8z6i.us-west-2.rds.amazonaws.com",
    "user": "c21venezuela",
    "password": "hI4xK.yVQjhd_mV2",
    "database": "venezuela2",
    "port": 3306
}

@app.get("/")
def read_root():
    return {"status": "online", "message": "C21V DB Explorer Ready"}

@app.get("/schema")
def get_schema():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get all tables
        cursor.execute("SHOW TABLES")
        tables = [list(row.values())[0] for row in cursor.fetchall()]
        
        schema = {}
        for table in tables:
            cursor.execute(f"DESCRIBE {table}")
            schema[table] = cursor.fetchall()
            
        cursor.close()
        conn.close()
        return {"tables": tables, "schema": schema}
    except Exception as e:
        return {"error": str(e)}

@app.get("/sample/{table}")
def get_sample(table: str, limit: int = 5):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute(f"SELECT * FROM {table} LIMIT {limit}")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"table": table, "sample": rows}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
