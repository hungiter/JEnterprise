from typing import List
from pydantic import BaseModel


class Heritage(BaseModel):
    city: str = ""
    country: str = ""
    admin_name: str = ""
    country_vi: List[str] = []
    heritage: str = ""
