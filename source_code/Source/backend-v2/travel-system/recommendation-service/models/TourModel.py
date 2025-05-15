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


class TourFeature(BaseModel):
    tour_code: str
    locations: List[str] = []
    activities: List[str] = []
    words: List[str] = []

    def get_location_text(self) -> str:
        """
        Return a text representation of locations. If locations are empty, return a default message.
        """
        if not self.locations:
            return "No locations available"
        return " ".join(self.locations)

    def get_activity_text(self) -> str:
        """
        Return a text representation of activities. If activities are empty, return a default message.
        """
        if not self.activities:
            return "No activities available"
        return " ".join(self.activities)

    def get_word_text(self) -> str:
        """
        Return a text representation of words. If words are empty, return a default message.
        """
        if not self.words:
            return "No words available"
        return " ".join(self.words)
