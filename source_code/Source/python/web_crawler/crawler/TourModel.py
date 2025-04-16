from pydantic import BaseModel
from typing import List

class TourDetail(BaseModel):
    id: str

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
