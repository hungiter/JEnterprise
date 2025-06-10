import os
import re
import sys
import threading
import time
import json
from typing import List
import itertools
from pymongo.errors import PyMongoError
from pymongo import UpdateOne
from tqdm import tqdm
from index import bulk_write_all, bulk_write_in_chunks, verbose, cache, clear_terminal, sparql, mongo_client, print_new_message, force_create_location_word_dict, force_initialize_heritage, force_update_cache_to_db
from SPARQLWrapper import JSON
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
from googletrans import Translator
from bson.json_util import dumps
from fastapi.responses import JSONResponse
import pickle

from models.HeritageModel import Heritage
DB_NAME = "JEnterprise"
HERITAGE_TABLE = "heritages"

location_word_cache = "cache_location_word"
heritage_cache = "cache_heritage"
cache_duration = 86400  # 24h
sleep_time = 0.1
dictionary_create_status = {
    "loading": False,
    "success": False,
    "message": "",
    "step": "pending"
}

future = None
wait_dictionary_create_executors = ThreadPoolExecutor(max_workers=1)

sp_all_results = []
sp_offset = 0
sp_limit = 100


def print_inline(text: str):
    print(f"\r{text}", end="", flush=True)


def create_location_word_cache():
    try:
        print("⏳ Start create location cache", flush=True)
        if heritage_cache in cache:
            raw_data = cache[heritage_cache]
            if raw_data:
                all_results = set()  # Sử dụng set để loại bỏ phần tử trùng lặp
                heritages: List[Heritage] = [
                    item if isinstance(item, Heritage) else Heritage(**item) for item in raw_data
                ]

                # Duyệt qua tất cả các Heritage objects và lấy các từ khóa cần thiết
                for heritage in heritages:
                    others = [heritage.city, heritage.admin_name,
                              heritage.heritage, heritage.country]

                    # Kiểm tra nếu country_vi là list và thêm vào 'others'
                    if isinstance(heritage.country_vi, list):
                        others.extend(heritage.country_vi)
                    else:
                        others.append(heritage.country_vi)

                    # Thêm tất cả các phần tử vào set để tránh trùng lặp
                    all_results.update(others)

                # Chuyển đổi lại thành list và lưu vào cache
                cache.set(location_word_cache, list(
                    all_results), expire=cache_duration)
                print("Heritage Cache created success", flush=True)
                return
            print("⚠️ Heritage cache is empty", flush=True)
            return

        print("⚠️ Heritage cache is not existed.", flush=True)
    except Exception as e:
        print(f"❌ Create Location Cache Error: {e}", flush=True)


def initialize_heritage_cache():
    try:
        print("⏳ Start init heritage cache", flush=True)
        db = mongo_client[DB_NAME]
        collection = db[HERITAGE_TABLE]

        last_id = None
        data = []
        total_docs = collection.count_documents({})
        chunk_size = max(total_docs // 10, 1)
        if chunk_size > 1000:
            chunk_size = 1000

        progress_bar = tqdm(
            total=total_docs, desc="Loading Heritages...", unit="docs")

        while True:
            query = {"_id": {"$gt": last_id}} if last_id else {}
            cursor = collection.find(query).sort("_id").batch_size(chunk_size)

            chunk = []
            try:
                for doc in cursor:
                    chunk.append(doc)
                    if len(chunk) >= chunk_size:
                        break
            except Exception as e:
                print(f"⚠️ Cursor iteration error, resuming...\n{e}")
                continue

            if not chunk:
                break

            new_data = [Heritage(**doc).dict() for doc in chunk]
            data.extend(new_data)

            last_id = chunk[-1]["_id"]

            progress_bar.update(len(chunk))  # Cập nhật tiến độ

            if data:
                cache.set(heritage_cache, data, expire=cache_duration)

        progress_bar.close()

    except Exception as e:
        print(f"❌ Initialize Heritage Cache Error\n{e}", flush=True)


def extend_heritage_cache_life():
    try:
        cache.set(heritage_cache,
                  cache[heritage_cache], expire=cache_duration)
    except:
        pass


def save_dictionary(data: List[Heritage]):
    try:
        print("⏳ Start save dictionary", flush=True)
        db = mongo_client[DB_NAME]
        collection = db[HERITAGE_TABLE]

        bulk_ops = []
        for index, heritage in enumerate(tqdm(data, desc="Processing heritages", file=sys.stdout)):
            # Find existing country_vi (optional - could pre-fetch if needed)
            # Take time on connecting with mongodb -> using already cache data
            primary_key = {
                "city": heritage.city,
                "country": heritage.country,
                "admin_name": heritage.admin_name,
                "heritage": heritage.heritage}
            try:
                bulk_ops.append(
                    UpdateOne(
                        primary_key,
                        {
                            "$set": heritage.dict(exclude={"country_vi"}),
                            "$addToSet": {
                                "country_vi": {"$each": heritage.country_vi}
                            }
                        },
                        upsert=True
                    ))
            except Exception as e:
                print(e)

        chunk_size = len(bulk_ops) // 10 or 1
        if chunk_size > 1000:
            chunk_size = 1000

        if bulk_ops:
            # Save cache first for data fetcher
            cache.set(heritage_cache, data, expire=cache_duration)
            # Save data to Mongodb
            if verbose:
                bulk_write_in_chunks(
                    collection, bulk_ops, chunk_size, "Save Dictionary")
            else:
                print("⏳ Started saving heritages to mongo at background", flush=True)
                thread = threading.Thread(
                    target=bulk_write_all,
                    args=(collection, bulk_ops, chunk_size),
                    daemon=True  # Set to True so thread will close when main program exits
                )
                thread.start()
            return True
        return False
    except Exception as e:
        print(
            f"❌ Save failed: {e} [save_dictionary]", flush=True)
        return False


def save_dictionary_from_cache():
    try:
        print("- Check Cache before save")
        if heritage_cache in cache:
            print_inline("-- Start create list for save")
            data = cache[heritage_cache]
            list_heritage = []
            if data:
                for item in data:
                    try:
                        heritage = Heritage(
                            city=item.get("city", ""),
                            country=item.get("country", ""),
                            admin_name=item.get("admin_name", ""),
                            country_vi=item.get("country_vi", []),
                            heritage=item.get("heritage", "")
                        )

                        list_heritage.append(heritage)
                    except Exception as e:
                        try:
                            heritage = Heritage(
                                city=item.city,
                                country=item.country,
                                admin_name=item.admin_name,
                                country_vi=item.country_vi,
                                heritage=item.heritage
                            )
                            list_heritage.append(heritage)
                        except Exception as e:
                            print(
                                f"⚠️ Append items failed: {e} [save_dictionary_from_cache]", flush=True)
                try:
                    if list_heritage:
                        save_dictionary(list_heritage)
                    return True
                except Exception as e:
                    print(
                        f"❌ Save failed: {e} [save_dictionary_from_cache]", flush=True)
                    return False
            else:
                return False
        else:
            print(
                "⚠️ No data to save [save_dictionary_from_cache]", flush=True)
            return False
    except Exception as e:
        print(
            f"❌ Save failed: {e} [save_dictionary_from_cache]", flush=True)
        return False


def dictionary_creator():
    global future, sleep_time

    # FUNCTION
    def extract_earth_places():
        try:
            dictionary_create_status["step"] = "read_csv"
            df = pd.read_csv("resources/worldcities.csv")
            df = df[['city', 'country', 'admin_name']].drop_duplicates()
        except Exception as e:
            if verbose:
                print(f"❌ Failed to load CSV: {e}", flush=True)
                return None

        dictionary_create_status["message"] = "CSV Re-processing"
        unique_countries = df['country'].dropna().unique()
        translator = Translator()

        # TRANSLATION ========================================================
        dictionary_create_status["step"] = "translating"
        dictionary_create_status["message"] = "Start Translating..."

        translated_dict = {}
        total = len(unique_countries)
        i = 0
        with tqdm(total=total, desc="Translating", unit="word", file=sys.stdout) as progress_bar:
            while i < total:
                country = None
                try:
                    country = unique_countries[i]
                    try:
                        translated = translator.translate(
                            country, src='en', dest='vi')
                        translated_dict[country] = translated.text
                    except Exception as e:
                        translated_dict[country] = country  # fallback
                        print(
                            f"⚠️ Error translating '{country}': {e}", flush=True)
                except Exception as e:
                    print(f"❌ Unexpected error at index {i}: {e}", flush=True)
                    break  # Optionally handle this differently

                time.sleep(sleep_time)  # Avoid rate limiting
                i += 1
                progress_bar.update(1)  # Update by 1, not by i!
        df['country_vi'] = df['country'].map(translated_dict)
        return df

    # Lấy danh lam thắng cảnh với spasql
    def extract_next_special_places():
        global sp_all_results, sp_offset, sp_limit

        def remove_in_location(place, location):
            if location and re.search(rf"\bin\s+{re.escape(location)}\b", place, re.IGNORECASE):
                # Xóa phần "in [location]" khỏi placeLabel
                return re.sub(rf"\s*\bin\s+{re.escape(location)}\b", "", place, flags=re.IGNORECASE).strip()
            return place
        # Bắt đầu vòng lặp
        message = f"Start fetching sparql {sp_offset}-{sp_offset+sp_limit}..."
        dictionary_create_status["message"] = message
        try:
            # Thực hiện truy vấn
            isGlobal = False
            if isGlobal == True:
                # Global
                sparql.setQuery(f"""
                SELECT ?placeLabel ?locationLabel ?countryLabel WHERE {{
                    ?place wdt:P31/wdt:P279* wd:Q570116.
                    OPTIONAL {{ ?place wdt:P131 ?location. }}
                    OPTIONAL {{ ?place wdt:P17 ?country. }}
                    SERVICE wikibase:label {{ bd:serviceParam wikibase:language "vi". }}
                }}
                LIMIT {sp_limit} OFFSET {sp_offset}
                """)
            else:  # Vietnam only
                sparql.setQuery(f"""
                    SELECT ?placeLabel ?locationLabel ?cityLabel ?countryLabel WHERE {{
                        ?place wdt:P17 wd:Q881.  # Country = Vietnam
                        VALUES ?type {{
                            wd:Q570116      # tourist attraction
                            wd:Q839954      # cultural heritage site
                            wd:Q35509       # historical site
                            wd:Q5707594     # scenic spot
                            wd:Q32815       # archaeological site
                            wd:Q33506       # temple
                            wd:Q751876      # pagoda
                            wd:Q23413       # palace
                            wd:Q44613       # mausoleum
                            wd:Q15936437    # world heritage site
                        }}
                        ?place wdt:P31 ?type
                        OPTIONAL {{ ?place wdt:P131 ?location. }}          # administrative location
                        OPTIONAL {{ ?place wdt:P131+/rdfs:label ?cityLabel.     # recursive to reach city
                        FILTER (LANG(?cityLabel) = "vi") }}
                        OPTIONAL {{ ?place wdt:P17 ?country. }}
                        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "vi". }}
                    }}
                    LIMIT {sp_limit} OFFSET {sp_offset}
                """)
            sparql.setReturnFormat(JSON)

            # Gửi truy vấn và xử lý dữ liệu
            results = sparql.query().convert()

            # Chuyển kết quả thành DataFrame
            result_list = results["results"]["bindings"]
            if result_list:
                for result in result_list:
                    country = result.get("countryLabel", {}).get("value", "")
                    city = ""
                    city_1 = result.get("locationLabel", {}).get("value", "")
                    city_2 = result.get("cityLabel", {}).get("value", "")
                    if city_1 and city_1 != country:
                        city = city_1
                    elif city_2 and city_2 != country:
                        city = city_2
                    else:
                        city = ""
                    location = result.get("placeLabel", {}).get("value", "")
                    if not location or not country or re.fullmatch(r"Q\d+", location) or len(re.findall(r"\d", location)) > 3:
                        continue
                    location = remove_in_location(location, city)
                    result_data = {"location": location,
                                   "city": city, "country": country}
                    sp_all_results.append(result_data)
                    message = f"{len(sp_all_results)}-{result_data}"
                    dictionary_create_status["message"] = message
                    # Optional: avoid rate limit
                    time.sleep(sleep_time)

                # Nếu ít hơn 1000 kết quả, dừng lại
                if len(result_list) < sp_limit:
                    return False

                # Cập nhật offset cho lần truy vấn tiếp theo
                sp_offset += sp_limit
        except Exception as e:
            print(f"❌ Extract Sparql failed: {e}", flush=True)
            return False

        return True

    def merge_df_with_world_places(world_places, world_special_places):
        if (verbose):
            clear_terminal()
        special_places = world_special_places.rename(
            columns={'location': 'heritage'})

        cities = special_places["city"]
        countries = special_places["country"]
        heritages = special_places["heritage"]

        merged_rows = []

        total_places = len(world_places)
        progress_bar = tqdm(
            total=total_places, desc="Merged heritages", file=sys.stdout)
        try:
            for idx1, row1 in world_places.iterrows():
                city = row1['city']
                country = row1['country']
                admin_name = row1.get('admin_name') or ''
                country_vi = row1.get('country_vi') or ''

                empty_info = {
                    'city': city,
                    'country': country,
                    'admin_name': admin_name,
                    'country_vi': country_vi,
                    'heritage': ""
                }
                if empty_info:
                    if empty_info not in merged_rows:
                        merged_rows.append(empty_info)

                # Tìm tất cả di sản phù hợp với city và country
                place_info = None
                if city in cities:
                    indexes = [i for i, x in enumerate(cities) if x == city]
                    for index in indexes:
                        try:
                            if country == countries[index] and heritages[index]:
                                place_info = {
                                    'city': city,
                                    'country': country,
                                    'admin_name': admin_name,
                                    'country_vi': country_vi,
                                    'heritage': heritages[index]
                                }
                                break
                        except:
                            pass
                elif city in countries:
                    indexes = [i for i, x in enumerate(countries) if x == city]
                    for index in indexes:
                        try:
                            if country == cities[index] and heritages[index]:
                                place_info = {
                                    'city': city,
                                    'country': country,
                                    'admin_name': admin_name,
                                    'country_vi': country_vi,
                                    'heritage': heritages[index]
                                }
                                break
                        except:
                            pass
                if place_info and place_info not in merged_rows:
                    merged_rows.append(place_info)
                progress_bar.update(1)  # update progress bar
        except Exception as e:
            progress_bar.close()
            print(f"❌ Merged dictionary failed: {e}", flush=True)

        merged = pd.DataFrame(merged_rows)
        return merged

    # PROCESSED
    try:
        dictionary_create_status["loading"] = True
        dictionary_create_status["success"] = False
        # MONGO HISTORY ===============================================================
        if heritage_cache not in cache or not cache[heritage_cache] or force_initialize_heritage == True:
            dictionary_create_status["step"] = "mongodb_heritage_fetch"
            dictionary_create_status["message"] = "Start Fetching..."
            initialize_heritage_cache()
        if location_word_cache not in cache or not cache[location_word_cache] or force_create_location_word_dict == True:
            dictionary_create_status["step"] = "create_location_word_dict"
            dictionary_create_status["message"] = "Start Creating..."
            create_location_word_cache()

        continuable = True
        if continuable == False:
            # FINISED STATE ==========================================================
            if heritage_cache not in cache or not cache[heritage_cache] or force_update_cache_to_db == True:
                dictionary_create_status["step"] = "update_cache_mongo"
                dictionary_create_status["message"] = "Start Updating..."
                save_dictionary_from_cache()
            dictionary_create_status["loading"] = False
            dictionary_create_status["success"] = True
            dictionary_create_status["step"] = "finished"
            dictionary_create_status["message"] = ""
            if heritage_cache in cache:
                return cache[heritage_cache]
            else:
                return

        # MERGED DATA ===========================================================
        place_cache_file = "storage_places_main.pickle"
        result_df = None
        if os.path.exists(place_cache_file):
            print("⏳ Start getting place from cache.")
            with open(place_cache_file, 'rb') as f:
                cached_dict = pickle.load(f)
                result_df = pd.DataFrame.from_dict(cached_dict)
        else:
            print("⏳ Start getting places.")
            # EARTH LOCATION ========================================================
            dictionary_create_status["step"] = "earth_places_detect"
            dictionary_create_status["message"] = "Start Detect..."
            earth_places_df = None
            earth_cache_file = "storage_places_sub1.pickle"
            if os.path.exists(earth_cache_file):
                print("⏳ Start getting earth_place from cache.")
                with open(earth_cache_file, 'rb') as f:
                    cached_dict = pickle.load(f)
                    earth_places_df = pd.DataFrame.from_dict(cached_dict)
            else:
                print("⏳ Start getting earth_place.")
                earth_places_df = extract_earth_places()
                with open(earth_cache_file, 'wb') as f:
                    pickle.dump(earth_places_df.to_dict(), f)
            # SPECIAL LOCATION ======================================================
            dictionary_create_status["step"] = "special_places_detect"
            dictionary_create_status["message"] = "Start Detect..."
            special_cache_file = "storage_places_sub2.pickle"
            special_places_df = None
            if os.path.exists(special_cache_file):
                print("⏳ Start getting special_place from cache.")
                with open(special_cache_file, 'rb') as f:
                    cached_dict = pickle.load(f)
                    special_places_df = pd.DataFrame.from_dict(cached_dict)
            else:
                print("⏳ Start getting special_place.")
                extract_next_special_places()
                special_places_df = pd.DataFrame(sp_all_results)
                with open(special_cache_file, 'wb') as f:
                    pickle.dump(special_places_df.to_dict(), f)
            dictionary_create_status["step"] = "earth_heritage_mapping"
            dictionary_create_status["message"] = "Start Mapping..."
            result_df = merge_df_with_world_places(
                earth_places_df, special_places_df)
            with open(place_cache_file, 'wb') as f:
                pickle.dump(result_df.to_dict(), f)

        print(f"Total rows:{len(result_df)}")
        # SAVE TO MONGO + CACHE =================================================
        dictionary_create_status["step"] = "heritage_saving"
        dictionary_create_status["message"] = "Start Saving..."
        json_str = result_df.to_json(orient='records', indent=2)
        data = json.loads(json_str)  # Parse json

        list_heritage = []
        progress_bar = tqdm(
            total=len(data), desc="Dict to Heritages...", unit="item")

        for item in data:
            try:
                city = item.get("city") or ""
                country = item.get("country") or ""
                admin_name = item.get("admin_name") or ""
                country_vi = item.get("country_vi") or ""
                heritage = item.get("heritage") or ""
                heritage_info = Heritage(
                    city=city,
                    country=country,
                    admin_name=admin_name,
                    country_vi=[country_vi] if country_vi else [],
                    heritage=heritage
                )

                list_heritage.append(heritage_info)
            except:
                pass
            progress_bar.update(1)
        progress_bar.close()
        save_dictionary(list_heritage)

        # FINISED STATE ==========================================================
        dictionary_create_status["loading"] = False
        dictionary_create_status["success"] = True
        dictionary_create_status["step"] = "finished"
        dictionary_create_status["message"] = ""
        return json_str
    except Exception as e:
        print(f"❌ Create dictionary failed: {e}", flush=True)
        dictionary_create_status["loading"] = False
        dictionary_create_status["success"] = False
        dictionary_create_status["step"] = ""
        dictionary_create_status["message"] = ""
        return


def fetch_dictionary_create(step_name: str, step_alias: str):
    global future, sleep_time
    try:
        if verbose:
            clear_terminal()
        # Step 1: Fetch from DB if no cache
        dictionary_execute = False
        if future:
            print_new_message("⏳ Countinue create dictionary...\n")
        else:
            print_new_message("⏳ Start creating dictionary...\n")
            dictionary_execute = True
            future = wait_dictionary_create_executors.submit(
                dictionary_creator)

        while True:
            try:
                # Step 2: Cache exist -> END
                if heritage_cache in cache and dictionary_execute == False:
                    print_new_message("Heritage cache existed.")
                    break  # Close stream after sending

                if future and future.done():
                    result = future.result()
                    if verbose:
                        if result:
                            payload = {"step": step_name, "step_alias": step_alias, "data": {
                                "status": "success", "source": "live"}}
                            message = f"{json.dumps(payload, default=str)}"
                            print_new_message(
                                f"fetch_dictionary_create.future_result: {message}")
                        else:
                            payload = {"step": step_name, "step_alias": step_alias, "data": {
                                "status": "error", "source": "live", "message": "No data found"}}
                            message = f"{json.dumps(payload, default=str)}"
                            print_new_message(
                                f"fetch_dictionary_create.future_result: {message}")
                    future = None
                    break
                else:
                    # Keep connection alive
                    if verbose:
                        payload = {"step": step_name, "step_alias": step_alias,
                                   "data": {"status": "waiting", "step": dictionary_create_status["step"], "message": dictionary_create_status["message"]}}
                        message = f"{json.dumps(payload, default=str)}"
                        print_new_message(
                            f"fetch_dictionary_create.future_waiting: {message}")
                    time.sleep(sleep_time)
            except Exception as e:
                if future:
                    print(f"⚠️ Failed create dict: {e} (RETRY)", flush=True)
        if dictionary_execute == True:
            print("Created dictionary.", flush=True)
        else:
            print("Received dictionary.", flush=True)
    except Exception as e:
        if verbose:
            print(f"❌ Failed create dict: {e}", flush=True)


def get_cache_dictionary():
    if heritage_cache in cache:
        data = cache[heritage_cache]
        if not data:
            return JSONResponse(content=json.loads(dumps({"status": "error", "message":  "Cache empty"})))
        return JSONResponse(content=json.loads(dumps({"status": "success", "data": data})), media_type="application/json")
    return JSONResponse(content=json.loads(dumps({"status": "error", "message": "Not have dictionary in cache"})))


def get_cache_location_word():
    if location_word_cache in cache:
        data = cache[location_word_cache]
        if not data:
            return JSONResponse(content=json.loads(dumps({"status": "error", "message":  "Cache empty"})))
        return JSONResponse(content=json.loads(dumps({"status": "success", "data": data})))
    return JSONResponse(content=json.loads(dumps({"status": "error", "message": "Not have dictionary in cache"})))
