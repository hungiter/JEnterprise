from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import diskcache
import time
from typing import List
from bs4 import BeautifulSoup
from crawler.TourModel import Tour, TourDetail
from crawler.APICrawler import get_detail_info
import re
crawl_target = "https://travel.com.vn"
cache = diskcache.Cache("cache")  # lưu vào thư mục cache/


def get_tour_from_html(url: str, html: str):
    soup = BeautifulSoup(html, 'html.parser')
    tour_detail = TourDetail()
    tour_div = soup.find('div', class_='tour--detail__content--left')
    try:
        tour_image_thumbnails = []
        tour_image_main = ""
        tour_sightseeing_spots = ""
        tour_cuisine = ""
        tour_suitable_customers = ""
        tour_ideal_times = ""
        tour_vehicles = ""
        try:
            image_div = tour_div.findChild(
                'div', class_='image-gallery')
            if image_div:
                thumbnails_div = image_div.find(
                    'div', class_='image-gallery--wrapper__thumbnails')
                if thumbnails_div:
                    image_divs = thumbnails_div.find_all('img')
                    if image_divs:
                        tour_image_thumbnails = [image_div['src']
                                                 for image_div in image_divs]
                img_main_div = image_div.find(
                    'div', class_='image-gallery--wrapper__main')
                if img_main_div:
                    image_div = img_main_div.find('img')
                    if image_div:
                        tour_image_main = image_div['src']

                image_div.decompose()

            overview_div = tour_div.findChild(
                'div', class_='tour-overview')
            if overview_div:
                overview_item_divs = overview_div.find_all(
                    "div", "tour--detail__content--left--overview__content-item")
                for overview_item_div in overview_item_divs:
                    overview_title = overview_item_div.find(
                        "div", "tour--detail__content--left--overview__content-title")
                    overview_info = overview_item_div.find("p")
                    title_text = overview_title.text
                    info_text = overview_info["title"]

                    match title_text:
                        case "Điểm tham quan":
                            tour_sightseeing_spots = info_text
                        case "Ẩm thực":
                            tour_cuisine = info_text
                        case "Đối tượng thích hợp":
                            tour_suitable_customers = info_text
                        case "Thời gian lý tưởng":
                            tour_ideal_times = info_text
                        case "Phương tiện":
                            tour_vehicles = info_text
                overview_div.decompose()
            

            schedule_div = tour_div.findChild(
                'div', class_='tour-schedule')
            if schedule_div:
                print(schedule_div)
        except Exception as e:
            pass

        tour_detail = TourDetail(
            img_main=tour_image_main,
            img_thumbnails=tour_image_thumbnails,
            sightseeing_spots=tour_sightseeing_spots,
            cuisine=tour_cuisine,
            suitable_customers=tour_suitable_customers,
            ideal_times=tour_ideal_times,
            vehicles=tour_vehicles
        )
    except Exception as e:
        print(f"Error extracting a tour: {e}")

    return tour_detail


def fetch_tour(url: str, tour_id: str):
    tour_detail = TourDetail()
    try:
        raw_data = ""
        if tour_id in cache:
            raw_data = cache[tour_id]
        else:
            options = Options()
            options.add_argument("--headless")
            options.add_argument(
                "--disable-blink-features=AutomationControlled")
            options.add_argument(
                "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36")

            driver = webdriver.Chrome(options=options)
            driver.get(url)
            time.sleep(5)  # Wait JS render

            raw_data = driver.page_source
            cache.set(tour_id, raw_data, expire=3600)
            driver.close()

        tour_detail = get_tour_from_html(url=url, html=raw_data)
        return tour_detail
    except Exception as e:
        return tour_detail


def get_tours_from_html(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    tour_list = soup.find_all('div', class_='card-filter-desktop')
    tours: List[Tour] = []
    index = 0
    for tour_div in tour_list:
        try:
            tour_id = ""
            tour_thumbnail = ""
            tour_tag = ""
            tour_title = ""
            tour_departure = ""
            tour_staytime = ""
            tour_vehicle = ""
            tour_calendar = []
            tour_price_value = 0
            tour_price_text = ""
            tour_detail_link = ""
            tour_detail = TourDetail()
            try:
                thumbnail_div = tour_div.findChild(
                    'div', class_='card-filter-desktop__thumbnail')
                if thumbnail_div:
                    thumbnail_img = thumbnail_div.findChild('img')
                    if thumbnail_img:
                        tour_thumbnail = thumbnail_img['src']

                    tour_tag_div = thumbnail_div.find(
                        'div', class_=lambda x: x and 'tour-card--tags__tag' in x.split())
                    if tour_tag_div:
                        tour_span_tag = tour_tag_div.findChild('span')
                        tour_tag = tour_span_tag.text

                    thumbnail_div.decompose()
            except Exception as e:
                pass

            try:
                tour_info_div = tour_div.findChild(
                    'div', class_='card-filter-desktop__content')
                if tour_info_div:
                    tour_title_a = tour_info_div.find(
                        'a', class_=lambda x: x and 'card-filter-desktop__content--header-title' in x.split())
                    if tour_title_a:
                        tour_title = tour_title_a['title']
                        tour_detail_link = f"{crawl_target}{tour_title_a['href']}"
                        tour_title_a.decompose()

                    tour_id_div = tour_info_div.find(
                        'div', class_=lambda x: x and 'info-tour-tourCode' in x.split())
                    if tour_id_div:
                        tour_id = tour_id_div.find('p').text
                        tour_id_div.decompose()

                    tour_departure_div = tour_info_div.find(
                        'div', class_=lambda x: x and 'info-tour-departure' in x.split())
                    if tour_departure_div:
                        tour_departure = tour_departure_div.find('p').text
                        tour_departure_div.decompose()

                    tour_staytime_div = tour_info_div.find(
                        'div', class_=lambda x: x and 'info-tour-dayStayText--time' in x.split())
                    if tour_staytime_div:
                        tour_staytime = tour_staytime_div.find('p').text
                        tour_staytime_div.decompose()

                    tour_vehicle_div = tour_info_div.find(
                        'div', class_=lambda x: x and 'info-tour-dayStayText' in x.split())
                    if tour_vehicle_div:
                        tour_vehicle = tour_vehicle_div.find('p').text
                        tour_vehicle_div.decompose()

                    tour_calendar_div = tour_info_div.find(
                        'div', class_=lambda x: x and 'info-tour-calendar' in x.split())
                    if tour_calendar_div:
                        start_date_divs = tour_calendar_div.findAll(
                            'div', class_='list-item')
                        tour_calendar = [date.text.strip()
                                         for date in start_date_divs]
                        tour_calendar_div.decompose()

                    tour_price_div = tour_info_div.find(
                        'div', class_=lambda x: x and 'card-filter-desktop__content--price-newPrice' in x.split())
                    if tour_price_div:
                        tour_price_text = tour_price_div.find('p').text
                        tour_price_value = int(
                            re.sub(r'\D', '', tour_price_text))
                        tour_price_div.decompose()
                    tour_info_div.decompose()
            except Exception as e:
                pass

            if index == 0:
                index = index+1
                try:
                    tour_detail = fetch_tour(tour_detail_link, tour_id)
                except Exception as e:
                    pass

            tour = Tour(
                tour_code=tour_id,
                thumbnail=tour_thumbnail,
                title=tour_title,
                departure=tour_departure,
                duration=tour_staytime,
                vehicle=tour_vehicle,
                calendar=tour_calendar,
                priceValue=tour_price_value,
                price=tour_price_text,
                detail_url=tour_detail_link,
                tag=tour_tag,
                tour_detail=tour_detail
            )
            tours.append(tour)
        except Exception as e:
            print(f"Error extracting a tour: {e}")
    return tours


def fetch_tours(url: str, data_name: str):
    try:
        raw_data_name = "raw_data"
        raw_data = ""
        if raw_data_name in cache:
            raw_data = cache[raw_data_name]
        else:
            options = Options()
            options.add_argument("--headless")
            options.add_argument(
                "--disable-blink-features=AutomationControlled")
            options.add_argument(
                "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36")

            driver = webdriver.Chrome(options=options)
            driver.get(url)
            time.sleep(5)  # Wait JS render
            raw_data = driver.page_source
            cache.set(raw_data_name, raw_data, expire=3600)
            driver.close()

        data = get_tours_from_html(raw_data)
        cache.set(data_name, data, expire=3600)
        return data
    except Exception as e:
        return ""
