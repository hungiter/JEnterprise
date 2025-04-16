from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import diskcache
import json

app = FastAPI()
cache = diskcache.Cache("cache")  # lưu vào thư mục cache/


class Tour(BaseModel):
    id: str
    thumbnail: str
    title: str
    tour_code: str
    departure: str
    duration: str
    vehicle: str
    departure_dates: List[str]
    price: str = ""
    detail_url: str
    tag: str = ""


class TourDetail(BaseModel):
    id: str


@app.get("/")
def root():
    return {"message": "Webcrawler API is working!"}

# @app.get("/crawl", response_model=List[Tour])


@app.get("/crawl")
def crawl_tours():
    clear_cache = False
    if clear_cache == True:
        cache.clear()

    try:
        data_name = "dltk_data"
        if data_name in cache:
            cache_data = cache[data_name]

            tours = get_tour_from_html(cache_data)
            # tour_data = json.dumps(tours)
            # save_cache_to_file(cache_data, "cache.html")

            return {"source": "cache", "data": len(cache_data)}
        else:
            return {"source": "live", "data": len(fetch_tours("https://travel.com.vn/du-lich-tiet-kiem.aspx", data_name))}
    except Exception as e:
        return {"message": "KO"}


def fetch_tours(url: str, data_name: str):
    try:
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36")

        driver = webdriver.Chrome(options=options)
        driver.get(url)
        time.sleep(5)  # Wait JS render

        data = driver.page_source
        cache.set(data_name, data, expire=600)
        return data
    except Exception as e:
        return ""


def fetch_data(url: str, data_name: str):
    return ""


def get_tour_from_html(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    tour_list = soup.find_all('div', class_='card-filter-desktop')
    print(f"Length: {len(tour_list)}")
    tours: List[Tour] = []
    for tour_div in tour_list:
        try:
            # link_tag = tour_div.find('a', class_='find-tour__box-link')
            # print(link_tag)
            tour_id = tour_div['id']
            print(tour_id)
            thumbnail_link = ""
            try:
                thumbnail_div = tour_div.findChild('div', class_='card-filter-desktop__thumbnail--content')
                print(thumbnail_div)
            except Exception as e:
                pass

        except Exception as e:
            print(f"Error extracting a tour: {e}")
    return tours

# detail_url = link_tag['href']
# id_ = link_tag['data-id']

# thumbnail = tour_div.find(
#     'div', class_='find-tour__img').find('img')['src']
# title = tour_div.find('div', class_='find-tour__name').text.strip()

# meta = tour_div.find(
#     'div', class_='find-tour__meta').find_all('li')
# tour_code = meta[0].text.strip()
# departure = meta[1].text.strip()
# duration = meta[2].text.strip()
# vehicle = meta[3].text.strip()

# date_div = tour_div.find('div', class_='find-tour__time')
# departure_dates = [li.text.strip()
#                     for li in date_div.find_all('li')] if date_div else []

# price_div = tour_div.find('div', class_='find-tour__price')
# price = price_div.text.strip() if price_div else ""

# tag_div = tour_div.find('div', class_='find-tour__tag')
# tag = tag_div.text.strip() if tag_div else ""

# tour = Tour(
#     id=id_,
#     thumbnail=thumbnail,
#     title=title,
#     tour_code=tour_code,
#     departure=departure,
#     duration=duration,
#     vehicle=vehicle,
#     departure_dates=departure_dates,
#     price=price,
#     detail_url=detail_url,
#     tag=tag
# )
# tours.append(tour)

def save_cache_to_file(data, filename='cache.json'):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(data)
    print(f"Cache data saved to {filename}")
