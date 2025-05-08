import time
import json
from pymongo.errors import PyMongoError
from index import cache, mongo_client, print_new_message, clear_message
from concurrent.futures import ThreadPoolExecutor, as_completed
from bson.json_util import dumps
from fastapi.responses import JSONResponse

from models.TourModel import Tour
DB_NAME = "JEnterprise"
TOURS_TABLE = "tours"

tour_cache = "cache_tour"
cache_duration = 86400  # 27h - backup 3h for sure
wait_mongo_tours_executors = ThreadPoolExecutor(max_workers=1)


# def get_first_tour():  # Test
#     try:
#         db = mongo_client[DB_NAME]
#         collection = db[TOURS_TABLE]
#         return collection.find_one()
#     except Exception as e:
#         print_new_message(f"❌ Lỗi kết nối MongoDB: {e}")
#         return None
def dict_to_tour_model(item):
    if isinstance(item, Tour):
        return item
    elif isinstance(item, dict):
        try:
            return Tour(**item)
        except Exception as e:
            print(f"⚠️ Lỗi khi chuyển dict thành Tour: {e}")
    return None  # hoặc raise tùy logic bạn muốn


def get_tours():  # Test
    try:
        db = mongo_client[DB_NAME]
        collection = db[TOURS_TABLE]

        last_id = None
        data = []
        chunk_size = 5000

        while True:
            query = {"_id": {"$gt": last_id}} if last_id else {}
            cursor = collection.find(query).sort("_id").batch_size(1000)

            chunk = []
            try:
                for doc in cursor:
                    chunk.append(doc)
                    if len(chunk) >= chunk_size:
                        break
            except PyMongoError as e:
                print_new_message(f"Cursor iteration error, resuming...\n{e}")
                continue  # retry the current iteration

            if not chunk:
                break  # no more data
            new_data = [Tour(**doc).dict() for doc in chunk]
            data.extend(new_data)

            last_id = chunk[-1]["_id"]  # save last processed ID
            # Update cache every chunk (optional)
            if data:
                cache.set(tour_cache, data, expire=cache_duration)

        return data
    except Exception as e:
        print_new_message(f"❌ Lỗi kết nối MongoDB: {e}")
        return None


def fetch_mongo_tours(step_name: str, step_alias: str):
    try:
        # Step 1: If not in cache → fetch from DB
        future = None
        mongo_execute = False
        if tour_cache not in cache:
            print_new_message("⏳ Fetching from Mongo...\n")
            mongo_execute = True
            future = wait_mongo_tours_executors.submit(get_tours)
        else:
            print_new_message("⏳ Fetching from Cache...\n")
        while True:
            try:
                # Step 2: If available, send to client
                if tour_cache in cache:
                    payload = {"step": step_name,  "step_alias": step_alias, "data": {
                        "status": "success", "source": "cache"}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    print_new_message(message)
                    break  # Close stream after sending
                elif future and future.done():
                    result = future.result()
                    if result:
                        cache.set(tour_cache, result, expire=36000)
                        payload = {"step": step_name, "step_alias": step_alias, "data": {
                            "status": "success", "source": "live"}}
                        message = f"{json.dumps(payload, default=str)}\n"
                        print_new_message(message)
                    else:
                        payload = {"step": step_name, "step_alias": step_alias, "data": {
                            "status": "error", "source": "live", "message": "No data found"}}
                        message = f"{json.dumps(payload, default=str)}\n"
                        print_new_message(message)
                    break
                else:
                    # Step 3: Keep connection alive while waiting
                    payload = {"step": step_name, "step_alias": step_alias,
                               "data": {"status": "waiting"}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    print_new_message(message)
                    time.sleep(1)
            except Exception as e:
                payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                           "message": f"Something went wrong {e}"}
                message = f"{json.dumps(payload, default=str)}\n"
                print_new_message(message)
                break
        if mongo_execute == True:
            print_new_message("Finished Update MongoTour to Cache\n")
        else:
            print_new_message("Finished Get Cache Tour\n")
    except Exception as e:
        payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                   "message": f"Something went wrong {e}"}
        message = f"{json.dumps(payload, default=str)}\n"
        print_new_message(message)
        clear_message()


def get_cache_tour():
    if tour_cache in cache:
        return JSONResponse(content=json.loads(dumps({"status": "success", "data": cache[tour_cache]})))
    return JSONResponse(content=json.loads(dumps({"status": "error", "message": "Not have tour in cache"})))
