// app/src/services/tour/TourService.ts
import axios from 'axios'
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
    } catch (error) {
        console.log(`Update tour_viewer failed. ${error}`)
    }
}