import re
import time
import json
from index import cache, sparql
from SPARQLWrapper import JSON
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
from googletrans import Translator
from bson.json_util import dumps
from fastapi.responses import JSONResponse

word_cache = "cache_word"
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


def dictionary_creator(sleep_time=0.1, verbose=True):

    # FUNCTION
    def extract_earth_places():
        try:
            dictionary_create_status["step"] = "read_csv"
            df = pd.read_csv("resources/worldcities.csv")
            df = df[['city', 'country', 'admin_name']].head(10)
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
                    # time.sleep(sleep_time)

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
        # First, try merging using English country name
        merge1 = pd.merge(world_special_places, world_places,
                          on=['city', 'country'], how='left')
        # Then try merging using Vietnamese name
        # For this, rename `country_vi` to `country` temporarily to match column
        # st_vi = world_places.drop(columns=['country']).rename(columns={'country_vi': 'country'})
        # merge2 = pd.merge(world_special_places, st_vi, on=['city', 'country'], how='left')
        merge2 = pd.merge(world_places, world_special_places, left_on=[
                          'city', 'country_vi'], right_on=['city', 'country'], how='left')

        # Combine results: prefer merge1 where data is not null, otherwise use merge2
        finaldff = merge1.combine_first(merge2)

        # Fill missing values with 'unknown'
        finaldff = finaldff.rename(columns={'location': 'heritage'})
        finaldff['admin_name'] = finaldff['admin_name'].fillna('')
        finaldff['country_vi'] = finaldff['country_vi'].fillna('')
        finaldff['heritage'] = finaldff['heritage'].fillna(
            'Không có danh lam thắng cảnh')

        # Ensure final column order
        finaldff = finaldff[['city', 'country',
                             'admin_name', 'country_vi', 'heritage']]
        return finaldff

    # PROCESSED
    try:
        dictionary_create_status["loading"] = True
        dictionary_create_status["success"] = False
        dictionary_create_status["step"] = "earth_places_detect"
        dictionary_create_status["message"] = "Start Detect..."
        earth_places_df = extract_earth_places()
        dictionary_create_status["step"] = "special_places_detect"
        dictionary_create_status["message"] = "Start Detect..."
        while extract_next_special_places():
            pass
        dictionary_create_status["step"] = "earth_heritage_mapping"
        dictionary_create_status["message"] = "Start Mapping..."
        special_places_df = pd.DataFrame(sp_all_results)
        result_df = merge_df_with_world_places(
            earth_places_df, special_places_df)
        # SPECIAL PLACE ADD ========================================================
        dictionary_create_status["loading"] = False
        dictionary_create_status["success"] = True
        dictionary_create_status["step"] = "finished"
        dictionary_create_status["message"] = ""
        json_str = result_df.to_json(orient='records', indent=2)
        cache.set(word_cache, json_str, expire=36000)
        return json_str
    except Exception as e:
        print(e)
        dictionary_create_status["loading"] = False
        dictionary_create_status["success"] = False
        dictionary_create_status["step"] = ""
        dictionary_create_status["message"] = ""
        return


def wait_dictionary_create(step_name: str, step_alias: str):
    global future
    try:
        # Step 1: If not in cache → fetch from DB
        dictionary_execute = False
        if word_cache not in cache:
            if future:
                print("⏳ Countinue create dictionary...\n")
            else:
                print("⏳ Start creating dictionary...\n")
                dictionary_execute = True
                future = wait_dictionary_create_executors.submit(
                    dictionary_creator)
        else:
            print("⏳ Fetching from Cache...\n")

        while True:
            try:
                # Step 2: If available, send to client
                if word_cache in cache:
                    payload = {"step": step_name,  "step_alias": step_alias, "data": {
                        "status": "success", "source": "cache"}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    yield message
                    print(message)
                    break  # Close stream after sending
                elif future and future.done():
                    result = future.result()
                    if result:
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
                               "data": {"status": "waiting", "step": dictionary_create_status["step"], "message": dictionary_create_status["message"]}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    yield message
                    print(message)
                    time.sleep(1)
                future = None
            except Exception as e:
                payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                           "message": f"Something went wrong {e}"}
                message = f"{json.dumps(payload, default=str)}\n"
                yield message
                print(message)
                break
        if dictionary_execute == True:
            print("Finished Create Dictionary\n")
        else:
            print("Finished Get Cache Dictionary\n")
    except Exception as e:
        payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                   "message": f"Something went wrong {e}"}
        message = f"{json.dumps(payload, default=str)}\n"
        yield message
        print(message)


last_message = ""


def print_new_message(message: str):
    global last_message
    if message != last_message:
        last_message = message
        print(last_message)
def clear_message():
    global last_message
    last_message = ""


def fetch_dictionary_create(step_name: str, step_alias: str):
    global future
    try:
        # Step 1: If not in cache → fetch from DB
        dictionary_execute = False
        if word_cache not in cache:
            if future:
                print_new_message("⏳ Countinue create dictionary...\n")
            else:
                print_new_message("⏳ Start creating dictionary...\n")
                dictionary_execute = True
                future = wait_dictionary_create_executors.submit(
                    dictionary_creator)
        else:
            print_new_message("⏳ Fetching from Cache...\n")

        while True:
            try:
                # Step 2: If available, send to client
                if word_cache in cache:
                    payload = {"step": step_name,  "step_alias": step_alias, "data": {
                        "status": "success", "source": "cache"}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    print_new_message(message)
                    break  # Close stream after sending
                elif future and future.done():
                    result = future.result()
                    if result:
                        payload = {"step": step_name, "step_alias": step_alias, "data": {
                            "status": "success", "source": "live"}}
                        message = f"{json.dumps(payload, default=str)}\n"
                        print_new_message(message)
                    else:
                        payload = {"step": step_name, "step_alias": step_alias, "data": {
                            "status": "error", "source": "live", "message": "No data found"}}
                        message = f"{json.dumps(payload, default=str)}\n"
                        print_new_message(message)
                    future = None
                    break
                else:
                    # Step 3: Keep connection alive while waiting
                    payload = {"step": step_name, "step_alias": step_alias,
                               "data": {"status": "waiting", "step": dictionary_create_status["step"], "message": dictionary_create_status["message"]}}
                    message = f"{json.dumps(payload, default=str)}\n"
                    print_new_message(message)
                    time.sleep(1)
            except Exception as e:
                payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                           "message": f"Something went wrong {e}"}
                message = f"{json.dumps(payload, default=str)}\n"
                print_new_message(message)
                break
        if dictionary_execute == True:
            print_new_message("Finished Create Dictionary\n")
        else:
            print_new_message("Finished Get Cache Dictionary\n")
    except Exception as e:
        payload = {"step": step_name,  "step_alias": step_alias, "data": {"status": "error"},
                   "message": f"Something went wrong {e}"}
        message = f"{json.dumps(payload, default=str)}\n"
        print_new_message(message)
        clear_message()


def get_cache_dictionary():
    if word_cache in cache:
        data = cache[word_cache]
        if not data:
            return {"error": "Cache empty"}
        data = json.loads(data) # Parse json
        return JSONResponse(content=json.loads(dumps({"status": "success", "data": data})), media_type="application/json")
    return JSONResponse(content=json.loads(dumps({"status": "error", "message": "Not have dictionary in cache"})))
