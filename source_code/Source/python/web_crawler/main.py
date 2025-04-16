from fastapi import FastAPI
import diskcache
from crawler.Crawler import fetch_tours
app = FastAPI()
cache = diskcache.Cache("cache")  # lưu vào thư mục cache/

@app.get("/")
def root():
    return {"message": "Webcrawler API is working!"}

# @app.get("/crawl", response_model=List[Tour])


@app.get("/crawl")
def crawl_tours():
    clear_cache = True
    if clear_cache == True:
        cache.delete("dltk_data")

    try:
        data_name = "dltk_data"
        if data_name in cache:
            cache_data = cache[data_name]

            return {"source": "cache", "data": cache_data}
        else:
            return {"source": "live", "data": fetch_tours("https://travel.com.vn/du-lich-tiet-kiem.aspx", data_name)}
    except Exception as e:
        return {"message": "KO"}


