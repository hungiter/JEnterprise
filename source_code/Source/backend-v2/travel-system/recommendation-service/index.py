import json
import os
from typing import Collection
import diskcache
from pymongo import MongoClient
from urllib.parse import quote_plus
from SPARQLWrapper import SPARQLWrapper
from tqdm import tqdm

from utils.CacheUtils import CacheManager


# Cấu hình MongoDB
USER = "admin"
PASS = quote_plus("hungnt121@gmail.com")  # Encode password
HOST = "jenterprise-cluster.50c8w.mongodb.net"
DB_NAME = "JEnterprise"
MONGO_URI = f"mongodb+srv://{USER}:{PASS}@{HOST}/{DB_NAME}?retryWrites=true&w=majority&appName=JENterprise-Cluster"
is_docker = True
# cache = diskcache.Cache("cache")
cache = CacheManager()
cache_duration = 86400  # 24h
mongo_client = MongoClient(MONGO_URI)
sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
last_message = ""
force_initialize_heritage = False
force_create_location_word_dict = False
force_update_cache_to_db = False
force_extract_feature = False
verbose = False

clear_cache = False
if clear_cache == True:
    cache.clear()
    # cache.delete("cache_tour")
    # cache.delete("cache_location_word")
    # cache.delete("cache_heritage")
    # cache.delete("cache_tour_features")


def clear_terminal():
    os.system('cls' if os.name == 'nt' else 'clear')


def print_new_message(message: str):
    global last_message
    if message != last_message:
        last_message = message
        print(last_message)


def clear_message():
    global last_message
    last_message = ""


def bulk_write_in_chunks(collection: Collection, operations, batch_size, desc):
    for i in tqdm(range(0, len(operations), batch_size), desc=desc):
        try:
            batch = operations[i:i + batch_size]
            # print(f"\n\nBATCH\n{batch}\n")
            collection.bulk_write(batch, ordered=False)
        except Exception as e:
            print(e)


def bulk_write_all(collection: Collection, operations, batch_size):
    for i in range(0, len(operations), batch_size):
        while True:
            try:
                batch = operations[i:i + batch_size]
                # print(f"\n\nBATCH\n{batch}\n")
                collection.bulk_write(batch, ordered=False)
                break
            except Exception as e:
                print(e)
