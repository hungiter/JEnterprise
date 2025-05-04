from datetime import datetime, date

def parse_dates_with_year_rollover(date_strings):
    result = []
    current_year = date.today().year
    prev_date = None

    for ds in date_strings:
        # Tách ngày và tháng
        day, month = map(int, ds.split('/'))

        # Ghép chuỗi đầy đủ theo định dạng YYYY-MM-DD
        current_date = date(current_year, month, day)

        # Nếu nhỏ hơn ngày trước → sang năm mới
        if prev_date and current_date < prev_date:
            current_year += 1
            current_date = date(current_year, month, day)

        result.append(f"{current_date}")
        prev_date = current_date

    return result