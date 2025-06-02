from concurrent.futures import ThreadPoolExecutor, as_completed
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import diskcache
import time
from typing import List
from bs4 import BeautifulSoup
from tqdm import tqdm
from crawler.DateUtils import parse_dates_with_year_rollover
from crawler.TourModel import ScheduleInfo, OldTour, TourDetail
import re
crawl_target = "https://travel.com.vn"
cache = diskcache.Cache("cache")  # lưu vào thư mục cache/
# page_loading_delay_time = 2  # 2 seconds
page_loading_delay_time = 5  # 5 seconds


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
        trip_plan = []
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
                'div', class_='section-detail tour--detail__content--left--overview tour-overview')
            if overview_div:
                overview_info_div = overview_div.findChild(
                    'div', class_='tour--detail__content--left--overview__content'
                )

                if overview_info_div:
                    overview_item_divs = overview_info_div.findAll(
                        "div", class_=lambda x: x and 'tour--detail__content--left--overview__content-item' in x.split())
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
                schedule_item_divs = schedule_div.findAll(
                    "div", class_=lambda x: x and 'item-schedule' in x.split())
                schedule_index = 0
                for schedule_item_div in schedule_item_divs:
                    # Reset value
                    schedule_index = schedule_index + 1
                    schedule_date = ""
                    schedule_title = ""
                    schedule_meal_info = ""
                    schedule_detail_html = ""

                    # Get Day + Location
                    schedule_item_title_div = schedule_item_div.find(
                        "div", class_=lambda x: x and 'item-title-content' in x.split())
                    if schedule_item_title_div:
                        title_p = schedule_item_title_div.find("p")
                        if title_p:
                            # Get Day
                            schedule_date_label = title_p.find("label")
                            if schedule_date_label:
                                schedule_date = schedule_date_label.get_text(
                                    strip=True)
                                match = re.match(
                                    r"(Ngày\s*\d+)", schedule_date)
                                if match:
                                    schedule_date = match.group(1)
                                else:
                                    schedule_date = ""
                                # print(schedule_date)
                            # Get Location
                            schedule_title_span = title_p.find("span")
                            if schedule_title_span:
                                schedule_title = schedule_title_span.get_text(
                                    strip=True)
                                # print(schedule_title)
                    # Get Meal Info
                    schedule_item_meal_info_div = schedule_item_div.find(
                        "div", class_=lambda x: x and 'meal-inFor' in x.split())
                    if schedule_item_meal_info_div:
                        schedule_meal_info_p = schedule_item_meal_info_div.find(
                            "p")
                        if schedule_meal_info_p:
                            schedule_meal_info = schedule_meal_info_p.get_text(
                                strip=True)
                            # print(schedule_meal_info)
                    # Get Info Html
                    schedule_item_detail_info_div = schedule_item_div.find(
                        "div", class_="inner")
                    if schedule_item_detail_info_div:
                        schedule_detail_html = schedule_item_detail_info_div.decode_contents()

                    try:
                        plan_info = ScheduleInfo(
                            index=schedule_index,
                            date_label=schedule_date,
                            title=schedule_title,
                            meal_info=schedule_meal_info,
                            detail_html=schedule_detail_html
                        )
                        trip_plan.append(plan_info)
                    except:
                        pass
                schedule_div.decompose()
        except Exception as e:
            pass

        tour_detail = TourDetail(
            img_main=tour_image_main,
            img_thumbnails=tour_image_thumbnails,
            sightseeing_spots=tour_sightseeing_spots,
            cuisine=tour_cuisine,
            suitable_customers=tour_suitable_customers,
            ideal_times=tour_ideal_times,
            vehicles=tour_vehicles,
            trip_plan=trip_plan
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
            time.sleep(page_loading_delay_time)  # Wait JS render

            raw_data = driver.page_source
            cache.set(tour_id, raw_data, expire=3600)
            driver.close()

        tour_detail = get_tour_from_html(url=url, html=raw_data)
        return tour_detail
    except Exception as e:
        return tour_detail

non_digit_re = re.compile(r'\D')

def get_tours_from_html(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    tour_list = soup.find_all('div', class_='card-filter-desktop')
    tours = []

    def extract_basic_tour_info(tour_div):
        try:
            tour_id = tour_thumbnail = tour_tag = tour_title = ""
            tour_departure = tour_staytime = tour_vehicle = ""
            tour_calendar = []
            tour_price_value = 0
            tour_price_text = ""
            tour_detail_link = ""

            # Thumbnail and tag
            thumbnail_img = tour_div.select_one('.card-filter-desktop__thumbnail img')
            if thumbnail_img:
                tour_thumbnail = thumbnail_img['src']
            tag_span = tour_div.select_one('.tour-card--tags__tag span')
            if tag_span:
                tour_tag = tag_span.text.strip()

            # Content block
            content = tour_div.select_one('.card-filter-desktop__content')
            if content:
                title_a = content.select_one('[class*="header-title"]')
                if title_a:
                    tour_title = title_a.get('title', '').strip()
                    tour_detail_link = f"{crawl_target}{title_a['href']}"

                def get_text(selector):
                    el = content.select_one(selector)
                    return el.text.strip() if el else ""

                tour_id = get_text('.info-tour-tourCode p')
                tour_departure = get_text('.info-tour-departure p')
                tour_staytime = get_text('.info-tour-dayStayText--time p')
                tour_vehicle = get_text('.info-tour-dayStayText p')

                date_divs = content.select('.info-tour-calendar .list-item')
                tour_calendar = [div.text.strip() for div in date_divs]
                tour_calendar = parse_dates_with_year_rollover(tour_calendar)

                price_p = content.select_one('.card-filter-desktop__content--price-newPrice p')
                if price_p:
                    tour_price_text = price_p.text.strip()
                    tour_price_value = int(non_digit_re.sub('', tour_price_text))

            return {
                "tour_code": tour_id,
                "thumbnail": tour_thumbnail,
                "title": tour_title,
                "departure": tour_departure,
                "duration": tour_staytime,
                "vehicle": tour_vehicle,
                "calendar": tour_calendar,
                "priceValue": tour_price_value,
                "price": tour_price_text,
                "detail_url": tour_detail_link,
                "tag": tour_tag,
            }
        except Exception as e:
            print(f"Error parsing basic info: {e}")
            return None

    def build_tour(tour_info):
        try:
            tour_detail = fetch_tour(tour_info["detail_url"], tour_info["tour_code"])
            tour = OldTour(tour_detail=tour_detail, **tour_info)
            return tour
        except Exception as e:
            print(f"Fetch Tour Error: {e}")
            return None

    # tour_infos = [extract_basic_tour_info(div) for div in tqdm(tour_list[0:10], desc="Extracting tour basic info", unit="") if div]
    tour_infos = [extract_basic_tour_info(div) for div in tqdm(tour_list, desc="Extracting tour basic info", unit="") if div]
    tour_infos = [info for info in tour_infos if info]

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(build_tour, info) for info in tour_infos]

        for future in tqdm(as_completed(futures), total=len(futures), desc="Extracting tour detailed info", unit=""):
            try:
                if os.name == 'nt': # For Windows
                    os.system('cls')
                else: # For macOS and Linux (posix)
                    os.system('clear')

                result = future.result()
                tours.append(result)
            except Exception as e:
                print(f"Error in thread: {e}")

    return [tour for tour in tours if tour]



def fetch_tours(url: str, data_name: str):
    try:
        options = Options()
        options.add_argument("--headless")
        options.add_argument("window-size=1920,1080")
        options.add_argument(
            "--disable-blink-features=AutomationControlled")
        options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36")
        driver = webdriver.Chrome(options=options)
        driver.get(url)
        time.sleep(page_loading_delay_time*2)  # Wait JS render
        raw_data = driver.page_source
        driver.close()

        data = get_tours_from_html(raw_data)
        cache.set(data_name, data, expire=36000)
        return data
    except Exception as e:
        print(e)
        return []
