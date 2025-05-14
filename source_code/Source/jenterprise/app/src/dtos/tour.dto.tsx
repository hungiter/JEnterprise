export interface ScheduleInfo {
  index: number
  date_label: string
  title: string
  meal_info: string
  detail_html: string
}


export interface TourDetail {
    img_main: string
    img_thumbnails: string[]
    sightseeing_spots: string
    cuisine: string
    suitable_customers: string
    ideal_times: string
    vehicles: string
    trip_plan: ScheduleInfo[]
}

export interface Tour {
    tourCode: string
    thumbnail: string
    title: string
    departure: string
    duration: string
    vehicle: string
    calendar: string[]
    price: string
    priceValue: number
    detailUrl: string
    tag: string
    tourDetail: TourDetail
}

export interface TourSummary {
    tour_code: string
    thumbnail: string
    title: string
    departure: string
    duration: string
    vehicle: string
    price: string
    price_value: number
    tag: string
    calendar: string[]
}


// Một điểm đặc trưng của tour
export interface TourFeature {
    tourCode: string;
    locations: string;
    activities: string;
    // Thêm các trường khác nếu cần
  }
  
  // Thông tin tương đồng
  export interface SimilarityInfo {
    tour: TourFeature;
    similarity: number;
  }
  
  // Kết quả từ API recommend
  export interface RecommendResult {
    input: TourFeature;
    detail: SimilarityInfo[];
    summary: string[];
    is_similar: boolean;
  }