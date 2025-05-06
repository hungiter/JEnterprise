import diskcache
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from bson.json_util import dumps
from fastapi import FastAPI
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from index import clear_terminal, cache
from service.TourService import wait_mongo_tours, fetch_mongo_tours, get_cache_tour
from service.DictionaryService import wait_dictionary_create, fetch_dictionary_create, get_cache_dictionary

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


def wait_data_processed():
    while True:
        step = ""
        step_alias = ""
        try:
            step = "mongo_tour_fetch"
            step_alias = "Fetching from Mongo..."
            yield from wait_mongo_tours(step, step_alias)

            step = "dict_create"
            step_alias = "Creating dictionary..."
            yield from wait_dictionary_create(step, step_alias)
            step = "finished_step"
            step_alias = "On finish process..."
            payload = {"step": step, "step_alias": step_alias,
                       "data": {"status": "success"}}
            yield f"{json.dumps(payload, default=str)}\n"
            break
        except Exception as e:
            payload = {"status": "error",
                       "message": f"Something went wrong {e}"}
            yield f"{json.dumps(payload, default=str)}\n"
            yield "data: All processing completed\n"
            break


@app.get("/data_processed")
def data_processed_test():
    return StreamingResponse(wait_data_processed(), media_type="text/event-stream")
# API Using ==============================================================================


@app.get("/cache_tour")
def cache_tour():
    return get_cache_tour()


@app.get("/cache_dictionary")
def cache_dictionary():
    return get_cache_dictionary()


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


data_processed_auto()
