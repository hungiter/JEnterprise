import re
import time
import json
from typing import List
import itertools
from pymongo.errors import PyMongoError
from pymongo import UpdateOne
from index import cache, sparql, mongo_client, print_new_message, clear_message, force_create_location_word_dict, force_initialize_heritage, force_update_cache_to_db
from SPARQLWrapper import JSON
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
from googletrans import Translator
from bson.json_util import dumps
from fastapi.responses import JSONResponse

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


def build_heritage_cache_index():
    index = {}
    if heritage_cache in cache:
        cache_data = cache[heritage_cache]
        for item in cache_data:
            obj = item if isinstance(item, Heritage) else Heritage(**item)
            key = (obj.city, obj.country, obj.admin_name, obj.heritage)
            index[key] = obj
    return index


def create_location_word_cache():
    try:
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
                print_new_message(
                    "create_location_word_cache.key_created_success")
                return
            print_new_message(
                "create_location_word_cache.heritage_cache_empty")
            return
        print_new_message("create_location_word_cache.no_heritage_cache")
    except Exception as e:
        print_new_message(f"create_location_word_cache.key_create_failed: {e}")


def initialize_heritage_cache():
    # # Sometime timeout
    # try:
    #     db = mongo_client[DB_NAME]
    #     collection = db[HERITAGE_TABLE]
    #     data = []
    #     docs = collection.find(batch_size=1000)
    #     chunk_size = 5000
    #     for chunk in chunked(docs, chunk_size):
    #         new_data = [Heritage(**doc).dict() for doc in chunk]
    #         data = list(data + new_data)
    #         if data:
    #             cache.set(heritage_cache, data, expire=cache_duration)
    # except Exception as e:
    #     print(f"Initialize Heritage Cache Error\n{e}")
    try:
        db = mongo_client[DB_NAME]
        collection = db[HERITAGE_TABLE]

        last_id = None
        data = []
        chunk_size = 5000

        print_new_message("Dictionary cache initialize...\n")
        while True:
            print_new_message("Continue initialize...\n")
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

            new_data = [Heritage(**doc).dict() for doc in chunk]
            data.extend(new_data)

            last_id = chunk[-1]["_id"]  # save last processed ID

            # Update cache every chunk (optional)
            if data:
                cache.set(heritage_cache, data, expire=cache_duration)

    except Exception as e:
        print_new_message(f"Initialize Heritage Cache Error\n{e}")


def extend_heritage_cache_life():
    try:
        cache.set(heritage_cache,
                  cache[heritage_cache], expire=cache_duration)
    except:
        pass


def save_dictionary(data: List[Heritage]):
    # # Too slow - 2*O(n)
    # try:
    #     db = mongo_client[DB_NAME]
    #     collection = db[HERITAGE_TABLE]
    #     for heritage in data:
    #         primary_key = {
    #             "city": heritage.city,
    #             "country": heritage.country,
    #             "admin_name": heritage.admin_name,
    #             "heritage": heritage.heritage
    #         }

    #         existed_heritage = collection.find_one(primary_key)
    #         existing_vi = []
    #         if existed_heritage:
    #             existing_vi = existed_heritage.get("country_vi", [])
    #         if heritage.country_vi:
    #             heritage.country_vi = list(
    #                 set(existing_vi + heritage.country_vi))

    #         collection.update_one(primary_key, {
    #             "$set": heritage.dict()}, upsert=True)
    #     cache.set(heritage_cache, data, expire=36000)
    # except Exception as e:
    #     print(f"❌ Lỗi kết nối MongoDB: {e}")
    #     return False

    # Faster - O(n)+1
    try:
        db = mongo_client[DB_NAME]
        collection = db[HERITAGE_TABLE]

        bulk_ops = []
        total = len(data)
        heritage_index = build_heritage_cache_index()
        for index, heritage in enumerate(data):
            # Find existing country_vi (optional - could pre-fetch if needed)
            prefix = f"{index+1}/{total}"
            need_update = False
            existing_vi = []
            # # Take time on connecting with mongodb -> using already cache data
            # primary_key = {
            #     "city": heritage.city,
            #     "country": heritage.country,
            #     "admin_name": heritage.admin_name,
            #     "heritage": heritage.heritage
            # }
            # existed_heritage = collection.find_one(primary_key)

            primary_key = (heritage.city, heritage.country,
                           heritage.admin_name, heritage.heritage)
            existed_heritage = heritage_index.get(primary_key)
            try:
                if existed_heritage:
                    print_new_message(
                        f"save_dictionary.found_from_cache: {primary_key}")
                else:
                    existed_heritage = collection.find_one({
                        "city": heritage.city,
                        "country": heritage.country,
                        "admin_name": heritage.admin_name,
                        "heritage": heritage.heritage
                    })
                    print_new_message(
                        f"save_dictionary.find_from_db: {primary_key}")
            except:
                continue

            if existed_heritage:
                existing_vi = existed_heritage.country_vi
                if existing_vi != [] and heritage.country_vi not in existing_vi:
                    for item in heritage.country_vi:
                        if item not in existing_vi:
                            need_update = True
                            continue
                dictionary_create_status[
                    "message"] = f"{prefix}-Update object {primary_key}"
            else:
                need_update = True
                dictionary_create_status["message"] = "{prefix}-Add new object"

            if need_update == True:
                if heritage.country_vi:
                    new_country_vi = []
                    for cvi in heritage.country_vi:
                        if "," in cvi:
                            parts = [part.strip() for part in cvi.split(',')]
                            permutations = list(itertools.permutations(parts))
                            for perm in permutations:
                                new_country_vi.append(' '.join(perm))
                        new_country_vi.append(cvi)
                    if heritage.country_vi != new_country_vi:
                        print_new_message(
                            f"save_dictionary.new_saving_country_vi: {new_country_vi}")
                    heritage.country_vi = list(
                        set(existing_vi + heritage.country_vi))

                bulk_ops.append(UpdateOne(
                    primary_key,
                    {"$set": heritage.dict()},
                    upsert=True
                ))
        if bulk_ops:
            collection.bulk_write(bulk_ops, ordered=False)

        cache.set(heritage_cache, data, expire=cache_duration)
        return True
    except Exception as e:
        print_new_message(f"save_dictionary.mongo_error: {e}")
        return False


def save_dictionary_from_cache():

    try:
        print_new_message("save_dictionary_from_cache.on_check_cache_existed")
        if heritage_cache in cache:
            print_new_message(
                "save_dictionary_from_cache.create_list_for_save")
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
                            print_new_message(
                                f"save_dictionary_from_cache.list_item_append_error: {e}")
                try:
                    if list_heritage:
                        save_dictionary(list_heritage)
                except Exception as e:
                    print_new_message(
                        f"save_dictionary_from_cache.save_error: {e}")
                return True
            else:
                return False
        else:
            print_new_message("save_dictionary_from_cache.none_data")
            return False
    except Exception as e:
        print_new_message(f"save_dictionary_from_cache.mongo_error: {e}")
        return False


def dictionary_creator(verbose=True):
    global future, sleep_time

    # FUNCTION
    def extract_earth_places():
        try:
            dictionary_create_status["step"] = "read_csv"
            df = pd.read_csv("resources/worldcities.csv")
            df = df[['city', 'country', 'admin_name']]
        except Exception as e:
            print(f"❌ Failed to load CSV: {e}")
            return None

        dictionary_create_status["message"] = "CSV Re-processing"
        unique_countries = df['country'].dropna().unique()
        translator = Translator()

        # TRANSLATION ========================================================
        dictionary_create_status["step"] = "translating"
        dictionary_create_status["message"] = "Start Translating..."

        translated_dict = {}
        total = len(unique_countries)

        for i, country in enumerate(unique_countries):
            try:
                translated = translator.translate(country, src='en', dest='vi')
                translated_dict[country] = translated.text
            except Exception as e:
                translated_dict[country] = country  # fallback
                if verbose:
                    print(f"⚠️ Error translating '{country}': {e}")
            # Display progress
            if verbose:
                percent = round((i + 1) / total * 100, 2)
                message = f"{percent}% - {country} → {translated_dict[country]}"
                dictionary_create_status["message"] = message
            # Avoid google rate limit
            time.sleep(sleep_time)
        # Gán cột mới đã dịch vào DataFrame
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
            print(e)
            return False

        return True

    def merge_df_with_world_places(world_places, world_special_places):
        special_places = world_special_places.rename(
            columns={'location': 'heritage'})

        # Merge using English country name (left join to keep all rows in world_places)
        merged = pd.merge(
            world_places,
            special_places[['city', 'country', 'heritage']],
            on=['city', 'country'],
            how='left'
        )

        # Fill heritage with default text where missing
        merged['city'] = merged['city'].fillna('')
        merged['country'] = merged['country'].fillna('')
        merged['country_vi'] = merged['country_vi'].fillna('')
        merged['admin_name'] = merged['admin_name'].fillna('')
        merged['heritage'] = merged['heritage'].fillna('')

        # Ensure final column order
        merged = merged[['city', 'country',
                         'admin_name', 'country_vi', 'heritage']]

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
        continuable = False
        if not continuable:
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

        dictionary_create_status["step"] = "earth_places_detect"
        dictionary_create_status["message"] = "Start Detect..."
        # EARTH LOCATION ========================================================
        earth_places_df = extract_earth_places()
        dictionary_create_status["step"] = "special_places_detect"
        dictionary_create_status["message"] = "Start Detect..."
        # SPECIAL LOCATION ======================================================
        while extract_next_special_places():
            pass
        # MERGED DATA ===========================================================
        dictionary_create_status["step"] = "earth_heritage_mapping"
        dictionary_create_status["message"] = "Start Mapping..."
        special_places_df = pd.DataFrame(sp_all_results)
        result_df = merge_df_with_world_places(
            earth_places_df, special_places_df)
        # SAVE TO MONGO + CACHE =================================================
        dictionary_create_status["step"] = "heritage_saving"
        dictionary_create_status["message"] = "Start Saving..."
        json_str = result_df.to_json(orient='records', indent=2)
        data = json.loads(json_str)  # Parse json
        list_heritage = []
        for item in data:
            heritage = Heritage(
                city=item.get("city", ""),
                country=item.get("country", ""),
                admin_name=item.get("admin_name", ""),
                country_vi=[item.get("country_vi", "")],
                heritage=item.get("heritage", "")
            )
            list_heritage.append(heritage)
        save_dictionary(list_heritage)

        # FINISED STATE ==========================================================
        dictionary_create_status["loading"] = False
        dictionary_create_status["success"] = True
        dictionary_create_status["step"] = "finished"
        dictionary_create_status["message"] = ""
        return json_str
    except Exception as e:
        print(e)
        dictionary_create_status["loading"] = False
        dictionary_create_status["success"] = False
        dictionary_create_status["step"] = ""
        dictionary_create_status["message"] = ""
        return


def fetch_dictionary_create(step_name: str, step_alias: str):
    global future, sleep_time
    try:
        # Step 1: If not in cache → fetch from DB
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
                # # Step 2: If available, send to client
                # if heritage_cache in cache:
                #     payload = {"step": step_name,  "step_alias": step_alias, "data": {
                #         "status": "success", "source": "cache"}}
                #     message = f"{json.dumps(payload, default=str)}\n"
                #     print_new_message(message)
                #     break  # Close stream after sending

                if future and future.done():
                    result = future.result()
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
                    # Step 3: Keep connection alive while waiting
                    payload = {"step": step_name, "step_alias": step_alias,
                               "data": {"status": "waiting", "step": dictionary_create_status["step"], "message": dictionary_create_status["message"]}}
                    message = f"{json.dumps(payload, default=str)}"
                    print_new_message(
                        f"fetch_dictionary_create.future_waiting: {message}")
                    time.sleep(sleep_time)
            except Exception as e:
                payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                           "message": f"Something went wrong {e}"}
                message = f"{json.dumps(payload, default=str)}"
                print_new_message(
                    f"fetch_dictionary_create.finished_future_check_error: {message}")
                break
        if dictionary_execute == True:
            print_new_message("fetch_dictionary_create.finished_create_dict")
        else:
            print_new_message("fetch_dictionary_create.finished_get_dict")
    except Exception as e:
        payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                   "message": f"Something went wrong {e}"}
        message = f"{json.dumps(payload, default=str)}"
        print_new_message(
            f"fetch_dictionary_create.finished_create_dict_error: {message}")
        clear_message()


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
