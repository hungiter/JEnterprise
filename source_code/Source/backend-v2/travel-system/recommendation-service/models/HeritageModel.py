from typing import List
from pydantic import BaseModel


class Heritage(BaseModel):
    city: str = ""
    country: str = ""
    admin_name: str = ""
    country_vi: List[str] = []
    heritage: str = ""

    def to_dict(self):
        return {
            "city": self.city,
            "country": self.country,
            "admin_name": self.admin_name,
            "country_vi": self.country_vi,
            "heritage": self.heritage
        }
