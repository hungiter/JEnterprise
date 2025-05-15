import re
import time
import json
from bs4 import BeautifulSoup
from typing import List

from pymongo import UpdateOne
from pymongo.errors import PyMongoError
from index import cache, cache_duration, mongo_client, print_new_message, clear_message, force_extract_feature
from bson.json_util import dumps
from fastapi.responses import JSONResponse
from concurrent.futures import ThreadPoolExecutor

from models.TourModel import TourFeature
from service.TourService import dict_to_tour_model
from py_vncorenlp.vncorenlp import tag_extractor
DB_NAME = "JEnterprise"
TOURS_FEATURES_TABLE = "tour_features"
tour_features_cache = "cache_tour_features"

# Trích xuất đặc trưng từ 2 thằng này
tour_cache = "cache_tour"
location_word_cache = "cache_location_word"
wait_tour_feature_extractor_executors = ThreadPoolExecutor(max_workers=1)

future = None
sleep_time = 0.1

extract_features_status = {
    "loading": False,
    "success": False,
    "message": "",
    "step": "pending"
}


def build_features_cache_index():
    index = {}
    if tour_features_cache in cache:
        cache_data = cache[tour_features_cache]
        for item in cache_data:
            obj = item if isinstance(
                item, TourFeature) else TourFeature(**item)
            key = (obj.city, obj.country, obj.admin_name, obj.heritage)
            index[key] = obj
    return index


def dict_to_tour_feature_model(item):
    if isinstance(item, TourFeature):
        return item
    elif isinstance(item, dict):
        try:
            return TourFeature(**item)
        except Exception as e:
            print(f"⚠️ Lỗi khi chuyển dict thành Tour: {e}")
    return None  # hoặc raise tùy logic bạn muốn


def initialize_heritage_cache():
    try:
        db = mongo_client[DB_NAME]
        collection = db[TOURS_FEATURES_TABLE]

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

            new_data = [TourFeature(**doc).dict() for doc in chunk]
            data.extend(new_data)

            last_id = chunk[-1]["_id"]  # save last processed ID

            # Update cache every chunk (optional)
            if data:
                cache.set(tour_features_cache, data, expire=cache_duration)

    except Exception as e:
        print_new_message(f"Initialize Heritage Cache Error\n{e}")


def save_features(data: List[TourFeature]):
    # Faster - O(n)+1
    try:
        db = mongo_client[DB_NAME]
        collection = db[TOURS_FEATURES_TABLE]

        bulk_ops = []
        total = len(data)
        feature_index = build_features_cache_index()
        for index, feature in enumerate(data):
            # Find existing country_vi (optional - could pre-fetch if needed)
            prefix = f"{index+1}/{total}"
            need_update = False
            existing_locations = []

            primary_key = (feature.tour_code)
            existed_feature = feature_index.get(primary_key)
            try:
                if existed_feature:
                    print_new_message(
                        f"save_features.found_from_cache: {primary_key}")
                else:
                    existed_feature = collection.find_one({
                        "tour_code": feature.tour_code
                    })
                    print_new_message(
                        f"save_features.find_from_db: {primary_key}")
            except:
                continue

            if existed_feature:
                existing_locations = existed_feature.locations
                if existing_locations != [] and feature.locations not in existing_locations:
                    for item in feature.locations:
                        if item not in existing_locations:
                            need_update = True
                            continue
                extract_features_status[
                    "message"] = f"{prefix}-Update object {primary_key}"
            else:
                need_update = True
                extract_features_status["message"] = "{prefix}-Add new object"

            if need_update == True:
                if feature.locations:
                    feature.locations = list(
                        set(existing_locations + feature.locations))

                bulk_ops.append(UpdateOne(
                    primary_key,
                    {"$set": feature.dict()},
                    upsert=True
                ))
        if bulk_ops:
            collection.bulk_write(bulk_ops, ordered=False)

        cache.set(tour_features_cache, data, expire=cache_duration)
        return True
    except Exception as e:
        print_new_message(f"save_features.mongo_error: {e}")
        return False


def save_features_from_cache():

    try:
        print_new_message("save_features_from_cache.on_check_cache_existed")
        if tour_features_cache in cache:
            print_new_message(
                "save_features_from_cache.create_list_for_save")
            data = cache[tour_features_cache]
            list_features = []
            if data:
                for item in data:
                    try:
                        feature = TourFeature(
                            tour_code=item.get("tour_code", ""),
                            locations=item.get("locations", []),
                            activities=item.get("activities", []),
                            activities=item.get("words", []),
                        )

                        list_features.append(feature)
                    except Exception as e:
                        try:
                            feature = TourFeature(
                                tour_code=item.tour_code,
                                locations=item.locations,
                                activities=item.activities,
                                words=item.words
                            )
                            list_features.append(feature)
                        except Exception as e:
                            print_new_message(
                                f"save_features_from_cache.list_item_append_error: {e}")
                try:
                    print(len(list_features))
                    if list_features:
                        save_features(list_features)
                except Exception as e:
                    print_new_message(
                        f"save_features_from_cache.save_error: {e}")
                return True
            else:
                return False
        else:
            print_new_message("save_features_from_cache.none_data")
            return False
    except Exception as e:
        print_new_message(f"save_features_from_cache.mongo_error: {e}")
        return False


def analyze_process():
    if tour_cache in cache and location_word_cache in cache:
        try:
            tours = cache[tour_cache]
            location_words = cache[location_word_cache]

            tour_features: List[TourFeature] = []
            extract_features_status["step"] = "location_feature_extract"

            # Tách location_words thành từ đơn và cụm từ
            single_words = set()
            multi_words = []

            for loc in location_words:
                loc = loc.strip()
                if " " in loc:
                    multi_words.append(loc)
                else:
                    single_words.add(loc.lower())

            # Tạo regex pattern cho cụm từ (multi-word)
            multi_words_sorted = sorted(multi_words, key=len, reverse=True)
            escaped_multi = [re.escape(loc) for loc in multi_words_sorted]
            multi_pattern = re.compile(
                r'\b(?:' + '|'.join(escaped_multi) + r')\b')

            for i, tour in enumerate(tours):
                tour_model = dict_to_tour_model(tour)
                if tour_model:
                    extract_features_status["message"] = f"{i+1}/{len(tours)} - {tour_model.tour_code}"
                    tour_title = tour_model.title or ""
                    trip_plan = ""
                    trip_plans = tour_model.tour_detail.trip_plan or []
                    for item in trip_plans:
                        plan = item.detail_html
                        try:
                            soup = BeautifulSoup(plan, "html.parser")
                            plan_text = soup.get_text(
                                strip=True, separator=" ")
                            trip_plan = f"{trip_plan}\n{plan_text}"
                        except Exception as e:
                            print(e)
                            break

                    # LOCATION EXTRACTOR ===================================START
                    content = f"{tour_title} {trip_plan}"
                    content_lower = content.lower()

                    # Khớp từ đơn bằng set
                    content_words = set(re.findall(r'\w+', content_lower))
                    matched_single = single_words.intersection(content_words)

                    # Khớp cụm từ bằng regex (nhạy cảm dấu)
                    matched_multi = set(multi_pattern.findall(content))
                    matched_multi = {loc.strip() for loc in matched_multi}

                    # Kết hợp kết quả
                    matched_locations = matched_single.union(matched_multi)

                    # Phân loại
                    multi_word_locs = [
                        loc for loc in matched_locations if ' ' in loc]
                    single_word_locs = [
                        loc for loc in matched_locations if ' ' not in loc]

                    # Chuẩn hóa cụm từ để tách từ từng cụm
                    words_in_multi = set()
                    for phrase in multi_word_locs:
                        words = re.findall(r'\w+', phrase.lower())
                        words_in_multi.update(words)

                    # Lọc từ đơn: bỏ nếu nó đã xuất hiện trong cụm
                    filtered_single_words = [
                        word for word in single_word_locs if word.lower() not in words_in_multi]

                    # Kết quả cuối cùng
                    final_locations = list(multi_word_locs)

                    if filtered_single_words:
                        # Giữ từ đơn dài nhất
                        longest_word = max(filtered_single_words, key=len)
                        final_locations.append(longest_word)

                        # Giữ thêm từ có chữ cái đầu viết hoa (khác từ dài nhất)
                        capitalized_words = [
                            w for w in filtered_single_words if w[0].isupper()]
                        final_locations.extend(
                            w for w in capitalized_words if w != longest_word)

                    # Loại trùng
                    final_locations = list(set(final_locations))
                    # LOCATION EXTRACTOR ===================================END

                    # VNCORENLP WORDS EXTRACTOR ============================START
                    words = []
                    try:
                        words_extract_result = tag_extractor(trip_plan)
                        words = words_extract_result["result"]
                    except:
                        pass
                    # VNCORENLP WORDS EXTRACTOR ============================END

                    # Gán kết quả vào TourFeature
                    tour_feature = TourFeature(
                        tour_code=tour_model.tour_code,
                        locations=final_locations,
                        words=words
                    )
                    tour_features.append(tour_feature.dict())

                # Ghi cache sau khi hoàn tất
                if tour_features:
                    cache.set(tour_features_cache, tour_features,
                              expire=cache_duration)
            if tour_features:
                save_features(tour_features)
            # message = {"status": "success",
            #            "tours": f"{len(tours)}", "location_words": f"{len(location_words)}", "tour_features": tour_features}
            # print_new_message(f"{message}")
            return tour_features
        except Exception as e:
            message = {"status": "error", "message": f"{e}"}
            print_new_message(f"{message}")
            return None
    else:
        message = {"status": "error", "message": "Missing cache data"}
        print_new_message(f"{message}")
        return None


def analyze_tour_features(step_name: str, step_alias: str):
    global future, sleep_time
    try:
        # Step 1: If not in cache → fetch from DB
        dictionary_execute = False
        if tour_features_cache not in cache or force_extract_feature == True:
            if future:
                print_new_message("analyze_tour_features.coutinue_analyze")
            else:
                print_new_message("analyze_tour_features.start_analyze")
                dictionary_execute = True
                future = wait_tour_feature_extractor_executors.submit(
                    analyze_process)
        else:
            save_features_from_cache()
        if future:
            while True:
                try:
                    if future.done():
                        result = future.result()
                        if result:
                            payload = {"step": step_name, "step_alias": step_alias, "data": {
                                "status": "success", "source": "live"}}
                            message = f"{json.dumps(payload, default=str)}"
                            print_new_message(
                                f"analyze_tour_features.future_result: {message}")
                        else:
                            payload = {"step": step_name, "step_alias": step_alias, "data": {
                                "status": "error", "source": "live", "message": "No data found"}}
                            message = f"{json.dumps(payload, default=str)}"
                            print_new_message(
                                f"analyze_tour_features.future_result: {message}")
                        future = None
                        break
                    else:
                        payload = {"step": step_name, "step_alias": step_alias,
                                   "data": {"status": "waiting", "step": extract_features_status["step"], "message": extract_features_status["message"]}}
                        message = f"{json.dumps(payload, default=str)}"
                        print_new_message(
                            f"analyze_tour_features.future_waiting: {message}")
                        # time.sleep(sleep_time)
                except Exception as e:
                    payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                               "message": f"Something went wrong {e}"}
                    message = f"{json.dumps(payload, default=str)}"
                    print_new_message(
                        f"analyze_tour_features.finished_future_check_error: {message}")
                    break
        if dictionary_execute == True:
            print_new_message("analyze_tour_features.finished_create_dict")
        else:
            print_new_message("analyze_tour_features.finished_get_dict")
    except Exception as e:
        payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                   "message": f"Something went wrong {e}"}
        message = f"{json.dumps(payload, default=str)}"
        print_new_message(
            f"analyze_tour_features.finished_create_dict_error: {message}")
        clear_message()


def get_cache_tour_features():
    if tour_features_cache in cache:
        return JSONResponse(content=json.loads(dumps({"status": "success", "data": cache[tour_features_cache]})))
    return JSONResponse(content=json.loads(dumps({"status": "error", "message": "Not have tour features in cache"})))
