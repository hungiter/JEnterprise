from fastapi import FastAPI
import diskcache
from crawler.Crawler import fetch_tours
from mongodb.MongoManager import update_old_tours, update_tours
app = FastAPI()
cache = diskcache.Cache("cache")  # lưu vào thư mục cache/
cache_map = [{
    "name": "dltk_data",
    "link": "https://travel.com.vn/du-lich-tiet-kiem.aspx"
}, {
    "name": "dltc_data",
    "link": "https://travel.com.vn/du-lich-tieu-chuan.aspx"
}, {
    "name": "dlgt_data",
    "link": "https://travel.com.vn/du-lich-gia-tot.aspx"
}
]


@app.get("/")
def root():
    return {"message": "Webcrawler API is working!"}

@app.get("/crawl")
def crawl_tours():
    clear_cache = True
    try:
        display_data = []
        for cache_item in cache_map:
            data_name = cache_item.get("name")
            if data_name:
                if clear_cache == True:
                    cache.delete(data_name)
                data_link = cache_item.get("link")
                if data_link:
                    print(f"Started fetch {data_link}")
                    result = {}
                    data = []
                    if data_name in cache:
                        cache_data = cache[data_name]
                        data = cache_data
                        cache.set(data_name, cache_data, expire=36000)
                        result = {"source": "cache", "data": cache_data}
                    else:
                        live_data = fetch_tours(data_link, data_name)
                        data = live_data
                        result = {"source": "live", "data": live_data}
                    display_data.append(result)
                    update_tours(data=data)
        return {"data": display_data}
    except Exception as e:
        print(e)
        return {"message": "Check backend 'cache_map'"}

# update_old_tours()
crawl_tours()