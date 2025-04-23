# API Link
# https://api2.travel.com.vn/auth/get-token : Reset token
# https://api2.travel.com.vn/core/tour/get-tour-info-month?pageId=13057 : GET LIST MONTH POSSIBLE - PID [LAST PART OF detail url]
# https://api2.travel.com.vn/core/tour/get-tour-info-day?tourCode=NDSGN1722&month=4&year=2025 : BASED ON GET LIST MONTH POSSIBLE
# https://api2.travel.com.vn/core/tour/get-tour-detail-day?tourCode=NDSGN1722-036-180425VU-V-7 : GET TOUR DETAIL BY CODE - DAY

import requests
import diskcache
import re
import jwt
import time

cache = diskcache.Cache("cache")  # lưu vào thư mục cache/


def get_detail_info(detail_url: str):
    try:
        match = re.search(r'pid-(\d+)', detail_url)
        if match:
            page_id = match.group(1)
            print(f"PageID: {page_id}")
            month_info = ""
            response = requests.get(
                    f"https://api2.travel.com.vn/core/tour/get-tour-info-month?pageId={page_id}", headers=get_token())
            if (response.status_code == 200):
                month_info = response.json()
            print(month_info)
        else:
            print("Page ID not found.")
        
        return ""
    except Exception as e:
        print(f"{e}")
        return ""


def get_token():
    user_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuIjoid2ViX3RyYXZlbCIsImMiOiJhYjcyOTZmMi0wNDg5LTRiNGQtODVhMi0wOTAwNmNjYjNlMGIiLCJ3IjoiVHJhdmVsLmNvbS52bnxodHRwczovL3RyYXZlbC5jb20udm4iLCJwIjoiVHJhdmVsfFRyYXZlbCIsInUiOiJhYjcyOTZmMi0wNDg5LTRiNGQtODVhMi0wOTAwNmNjYjNlMGJ8NDY5NGM2ODItNDZjNy00Y2M2LWExOTQtOTY4ZWE5NWU5Y2M5IiwiciI6IkFkbWluIiwiZXhwIjoxNzQ0OTA5MjAwLCJpc3MiOiJ0cmF2ZWwuY29tLnZuIiwiYXVkIjoiYWI3Mjk2ZjItMDQ4OS00YjRkLTg1YTItMDkwMDZjY2IzZTBiIn0.B4poxclER9I_mJpUx209hslSiwWlrz37g7GvdLVwIsU"
    client_id = "AB7296F2-0489-4B4D-85A2-09006CCB3E0B"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0',
        'Authorization': f'Bearer {user_token}',
        'ClientId': f'{client_id}'
    }
    return headers
