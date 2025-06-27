// app/src/services/tour/TourService.ts
import axios, { AxiosError } from 'axios'
import { API_TOUR_BASE } from '../api_info'

export const update_tour_viewers = async (tour_code: string) => {
    try {
        await axios.post(`${API_TOUR_BASE}/check_viewer`,
            {
                "tour_code": tour_code
            },
            {
                headers: { "ngrok-skip-browser-warning": "true" }
            }
        );
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Cập nhật số lượng xem tour thất bại: ${error.message}`)
        } else {
            console.error(`Cập nhật số lượng xem tour thất bại:\n ${error}`)
        }
    }
}