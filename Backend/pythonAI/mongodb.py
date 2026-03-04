from pymongo import MongoClient
import os
from os import getenv
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ROOT_ENV_PATH = BASE_DIR.parent.parent / ".env"
load_dotenv(dotenv_path=ROOT_ENV_PATH)
load_dotenv()
# ✅ MongoDB Connection
MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client["test"]  # Your database name
collection = db["auditreports"]

def get_latest_audit_report():
    """Fetch the latest audit report from MongoDB"""
    return collection.find_one(sort=[("_id", -1)])
