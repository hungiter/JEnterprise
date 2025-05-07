import threading
from fastapi.middleware.cors import CORSMiddleware
from bson.json_util import dumps
from fastapi import FastAPI
import json

from index import clear_terminal, cache
from service.TourService import fetch_mongo_tours, get_cache_tour
from service.DictionaryService import fetch_dictionary_create, get_cache_dictionary, get_cache_location_word
from service.FeatureExtractorService import analyze_tour_features, get_cache_tour_features
from service.RecommendationService import create_similarity_matrix, get_top_n_similar_tours, get_similar_matrix
# App API
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend's URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)
clear_terminal()


@app.get("/")
def root():
    return {"message": "Webcrawler API is working!"}


@app.get("/cache_tour")
def cache_tour():
    return get_cache_tour()


@app.get("/cache_dictionary")
def cache_dictionary():
    return get_cache_dictionary()


@app.get("/cache_location_word")
def cache_location_word():
    return get_cache_location_word()


@app.get("/feature_extractor")
def cache_tour_features():
    return get_cache_tour_features()


@app.get("/similar_tour/{tour_code}")
def get_similar_tour(tour_code: str):
    return get_top_n_similar_tours(tour_code=tour_code)


@app.get("/similarity_matrix")
def similarity_matrix():
    return get_similar_matrix()


def data_processed_auto():  # DAILY AUTO RUN
    def data_processed():
        step = ""
        step_alias = ""
        try:
            step = "mongo_tour_fetch"
            step_alias = "Fetching from Mongo..."
            fetch_mongo_tours(step, step_alias)

            step = "dict_create"
            step_alias = "Creating dictionary..."
            fetch_dictionary_create(step, step_alias)

            step = "extract_tour_feature"
            step_alias = "Extracting..."
            analyze_tour_features(step, step_alias)

            step = "renew_train_model"
            step_alias = "Training..."
            create_similarity_matrix()

            step = "finished_step"
            step_alias = "On finish process..."
            payload = {"step": step, "step_alias": step_alias,
                       "data": {"status": "success"}}
            print(payload)
        except Exception as e:
            payload = {"status": "error",
                       "message": f"Something went wrong {e}"}
            print(payload)
    data_processed()
    tour = cache_tour()
    tour_json = json.loads(tour.body.decode())
    dictionary = cache_dictionary()
    dictionary_json = json.loads(dictionary.body.decode())
    if tour_json.get("status") == "success" and dictionary_json.get("status") == "success":
        print("Finished daily processed")


def run_daily_background_task():  # Running task at background
    threading.Thread(target=data_processed_auto).start()


run_daily_background_task()
