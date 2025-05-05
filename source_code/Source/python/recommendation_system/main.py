import requests
import json
import pandas as pd
from googletrans import Translator
import time
from IPython.display import clear_output

# lưu vào thư mục cache/
import diskcache
cache = diskcache.Cache("cache")

# Cấu hình MongoDB
from pymongo import MongoClient
from urllib.parse import quote_plus
USER = "admin"
PASS = quote_plus("hungnt121@gmail.com")  # Encode password
HOST = "jenterprise-cluster.50c8w.mongodb.net"
DB_NAME = "JEnterprise"
TOURS_TABLE = "tours"
MONGO_URI = f"mongodb+srv://{USER}:{PASS}@{HOST}/{DB_NAME}?retryWrites=true&w=majority&appName=JENterprise-Cluster"

# App API
from fastapi import FastAPI
app = FastAPI()

import re
from SPARQLWrapper import SPARQLWrapper, JSON
sparql = SPARQLWrapper("https://query.wikidata.org/sparql")


@app.get("/")
def root():
    return {"message": "Webcrawler API is working!"}

# @app.get("/crawl", response_model=List[Tour])


@app.get("/crawl")
def data_extractor():
    clear_cache = False
    if clear_cache == True:
       cache.delete("cache")