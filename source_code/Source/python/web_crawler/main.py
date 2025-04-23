from fastapi import FastAPI
import diskcache
from crawler.Crawler import fetch_tours
from mongodb.MongoManager import update_tours
app = FastAPI()
cache = diskcache.Cache("cache")  # lưu vào thư mục cache/


@app.get("/")
def root():
    return {"message": "Webcrawler API is working!"}

# @app.get("/crawl", response_model=List[Tour])


@app.get("/crawl")
def crawl_tours():
    clear_cache = False
    if clear_cache == True:
        cache.delete("dltk_data")

    try:
        data_name = "dltk_data"
        result = {}
        data = []
        if data_name in cache:
            cache_data = cache[data_name]
            data = cache_data
            cache.set(data_name, cache_data, expire=3600)
            result = {"source": "cache", "data": cache_data}
        else:
            live_data = fetch_tours(
                "https://travel.com.vn/du-lich-tiet-kiem.aspx", data_name)
            data = live_data
            result = {"source": "live", "data": live_data}

        update_tours(data=data)
        return result
    except Exception as e:
        print(e)
        return {"message": "KO"}
