import os
import diskcache
from pymongo import MongoClient
from urllib.parse import quote_plus
from SPARQLWrapper import SPARQLWrapper


# Cấu hình MongoDB
USER = "admin"
PASS = quote_plus("hungnt121@gmail.com")  # Encode password
HOST = "jenterprise-cluster.50c8w.mongodb.net"
DB_NAME = "JEnterprise"
MONGO_URI = f"mongodb+srv://{USER}:{PASS}@{HOST}/{DB_NAME}?retryWrites=true&w=majority&appName=JENterprise-Cluster"
cache = diskcache.Cache("cache")
mongo_client = MongoClient(MONGO_URI)
sparql = SPARQLWrapper("https://query.wikidata.org/sparql")


clear_cache = True
if clear_cache == True:
    cache.clear()


def clear_terminal():
    os.system('cls' if os.name == 'nt' else 'clear')
