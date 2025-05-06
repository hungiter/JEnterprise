import time
import json
from index import cache, mongo_client
from concurrent.futures import ThreadPoolExecutor, as_completed
from bson.json_util import dumps
from fastapi.responses import JSONResponse
DB_NAME = "JEnterprise"
TOURS_TABLE = "tours"
tour_cache = "cache_tour"

wait_mongo_tours_executors = ThreadPoolExecutor(max_workers=1)


def get_first_tour():  # Test
    try:
        db = mongo_client[DB_NAME]
        collection = db[TOURS_TABLE]
        return collection.find_one()
    except Exception as e:
        print(f"❌ Lỗi kết nối MongoDB: {e}")
        return None


def wait_mongo_tours(step_name: str, step_alias: str):
    try:
        # Step 1: If not in cache → fetch from DB
        future = None
        mongo_execute = False
        if tour_cache not in cache:
            print("⏳ Fetching from Mongo...\n")
            mongo_execute = True
            future = wait_mongo_tours_executors.submit(get_first_tour)
        else:
            print("⏳ Fetching from Cache...\n")
        while True:
            try:
                # Step 2: If available, send to client
                if tour_cache in cache:
                    payload = {"step": step_name,  "step_alias": step_alias, "data": {
                        "status": "success", "source": "cache"}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    yield message
                    print(message)
                    break  # Close stream after sending
                elif future and future.done():
                    result = future.result()
                    if result:
                        cache.set(tour_cache, result, expire=36000)
                        payload = {"step": step_name, "step_alias": step_alias, "data": {
                            "status": "success", "source": "live"}}
                        message = f"{json.dumps(payload, default=str)}\n"
                        yield message
                        print(message)
                    else:
                        payload = {"step": step_name, "step_alias": step_alias, "data": {
                            "status": "error", "source": "live", "message": "No data found"}}
                        message = f"{json.dumps(payload, default=str)}\n"
                        yield message
                        print(message)
                    break
                else:
                    # Step 3: Keep connection alive while waiting
                    payload = {"step": step_name, "step_alias": step_alias,
                               "data": {"status": "waiting"}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    yield message
                    print(message)
                    time.sleep(1)
            except Exception as e:
                payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                           "message": f"Something went wrong {e}"}
                message = f"{json.dumps(payload, default=str)}\n"
                yield message
                print(message)
                break
        if mongo_execute == True:
            print("Finished Update MongoTour to Cache\n")
        else:
            print("Finished Get Cache Tour\n")
    except Exception as e:
        payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                   "message": f"Something went wrong {e}"}
        message = f"{json.dumps(payload, default=str)}\n"
        yield message
        print(message)


def fetch_mongo_tours(step_name: str, step_alias: str):
    try:
        # Step 1: If not in cache → fetch from DB
        future = None
        mongo_execute = False
        if tour_cache not in cache:
            print("⏳ Fetching from Mongo...\n")
            mongo_execute = True
            future = wait_mongo_tours_executors.submit(get_first_tour)
        else:
            print("⏳ Fetching from Cache...\n")
        while True:
            try:
                # Step 2: If available, send to client
                if tour_cache in cache:
                    payload = {"step": step_name,  "step_alias": step_alias, "data": {
                        "status": "success", "source": "cache"}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    print(message)
                    break  # Close stream after sending
                elif future and future.done():
                    result = future.result()
                    if result:
                        cache.set(tour_cache, result, expire=36000)
                        payload = {"step": step_name, "step_alias": step_alias, "data": {
                            "status": "success", "source": "live"}}
                        message = f"{json.dumps(payload, default=str)}\n"
                        print(message)
                    else:
                        payload = {"step": step_name, "step_alias": step_alias, "data": {
                            "status": "error", "source": "live", "message": "No data found"}}
                        message = f"{json.dumps(payload, default=str)}\n"
                        print(message)
                    break
                else:
                    # Step 3: Keep connection alive while waiting
                    payload = {"step": step_name, "step_alias": step_alias,
                               "data": {"status": "waiting"}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    print(message)
                    time.sleep(1)
            except Exception as e:
                payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                           "message": f"Something went wrong {e}"}
                message = f"{json.dumps(payload, default=str)}\n"
                print(message)
                break
        if mongo_execute == True:
            print("Finished Update MongoTour to Cache\n")
        else:
            print("Finished Get Cache Tour\n")
    except Exception as e:
        payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                   "message": f"Something went wrong {e}"}
        message = f"{json.dumps(payload, default=str)}\n"
        print(message)


def get_cache_tour():
    if tour_cache in cache:
        return JSONResponse(content=json.loads(dumps({"status": "success", "data": cache[tour_cache]})))
    return JSONResponse(content=json.loads(dumps({"status": "error", "message": "Not have tour in cache"})))
