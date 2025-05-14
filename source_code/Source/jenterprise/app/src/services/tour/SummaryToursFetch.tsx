// app/src/services/tour/TourService.ts
import axios from 'axios'
import type { TourSummary } from '@/src/dtos/tour.dto'
import { API_TOUR_BASE } from '../api_info'

export const fetchSummaryTours = async (tourCodes: string[]): Promise<TourSummary[]> => {
    const res = await axios.post<TourSummary[]>(`${API_TOUR_BASE}/summary_tours`,
        { "tour_codes": tourCodes }, // đây là phần body
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    console.log(res.data);
    return res.data
}