export interface TourDetail {
    img_main: string
    img_thumbnails: string[]
    sightseeing_spots: string
    cuisine: string
    suitable_customers: string
    ideal_times: string
    vehicles: string
    trip_plan: string[]
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