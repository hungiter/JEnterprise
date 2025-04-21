from pymongo import MongoClient
from urllib.parse import quote_plus
from typing import List
from crawler.TourModel import Tour

# Cấu hình MongoDB
USER = "admin"
PASS = quote_plus("hungnt121@gmail.com")  # Encode password
HOST = "jenterprise-cluster.50c8w.mongodb.net"
DB_NAME = "JEnterprise"
TOURS_TABLE = "tours"
MONGO_URI = f"mongodb+srv://{USER}:{PASS}@{HOST}/{DB_NAME}?retryWrites=true&w=majority&appName=JENterprise-Cluster"

def update_tours(data:List[Tour], many=False):
    # Adjust if using MongoDB Atlas
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[TOURS_TABLE]
    print(f"✅ Đã chọn collection: {collection}")
    return True