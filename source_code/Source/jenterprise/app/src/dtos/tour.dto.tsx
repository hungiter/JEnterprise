// Thông tin lịch trình tour
export interface ScheduleInfo {
  index: number
  date_label: string
  title: string
  meal_info: string
  detail_html: string
}

// Chi tiết tour
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

// Thông tin tour đầy đủ
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

// Thông tin tóm tắt tour
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

// Đặc điểm của tour
export interface TourFeature {
  tourCode: string;
  locations: string;
  activities: string;
  // Có thể thêm các trường khác nếu cần
}

// Thông tin tương đồng giữa các tour
export interface SimilarityInfo {
  tour: TourFeature;
  similarity: number;
}

// Kết quả từ API gợi ý tour
export interface RecommendResult {
  input: TourFeature;
  detail: SimilarityInfo[];
  summary: string[];
  is_similar: boolean;
}

// Phản hồi từ API tương đồng
export interface SimilarityResponse {
  success: boolean;
  data: RecommendResult;
}

// Sự quan tâm của người dùng với tour
export interface TourEngagement {
  tourId: string;
  userId: string;
  sessionId: string;
  status: string;
  lastTimestamp: number;
}

// Đơn hàng tour của người dùng
export interface TourOrder {
  id: string;        // Mã đơn hàng
  instanceId: string;        // Mã tour: tourCode_XXXXXXXX (XXXXXXXX:16022025->16-02-2025)
  username: string;          // Tên người dùng
  totalTicket: number;       // Tổng số vé
  ticketPrice: number;       // Giá vé
  status: string;            // Trạng thái đơn hàng
  // createdAt: number;         // Thời gian tạo đơn hàng
  // updatedAt: number;         // Thời gian cập nhật (chấp nhận/từ chối)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface OrderCreateRequest {
  instanceId: string;
  username: string;
  totalTicket: number;
  ticketPrice: number;
}

export interface OrderCreateResponse {
  success: boolean;
  message?: string;
  tourOrder?: TourOrder;
}

export interface OrderPaidRequest {
  instanceId: string;
  username: string;
}

export interface OrderPaidResponse {
  success: boolean;
  message?: string;
  tourOrder?: TourOrder;
}