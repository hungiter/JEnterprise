from pydantic import BaseModel
from typing import List

class ScheduleInfo(BaseModel):
    index: int = -1
    date_label: str = ""
    title: str = ""
    meal_info: str = ""
    detail_html: str = ""


class TourDetail(BaseModel):
    img_main: str = ""
    img_thumbnails: List[str] = []
    sightseeing_spots: str = ""
    cuisine: str = ""
    suitable_customers: str = ""
    ideal_times: str = ""
    vehicles: str = ""
    trip_plan: List[ScheduleInfo] = []


class Tour(BaseModel):
    tour_code: str
    thumbnail: str
    title: str
    departure: str
    duration: str
    vehicle: str
    calendar: List[str]
    price: str = ""
    priceValue: int
    detail_url: str
    tag: str = ""
    tour_detail: TourDetail
