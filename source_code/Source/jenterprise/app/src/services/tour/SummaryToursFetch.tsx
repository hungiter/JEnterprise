// app/src/services/tour/TourService.ts
import type { TourSummary } from '@/src/dtos/tour.dto'
import api, { API_TOUR_BASE } from '../api_info';
import axios from 'axios';

export const fetchSummaryTours = async (tourCodes: string[]): Promise<TourSummary[]> => {
    const res = await axios.post<TourSummary[]>(`${API_TOUR_BASE}/summary_tours`,
        { "tour_codes": tourCodes }, // đây là phần body
        {
            headers: {
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "true"
            }
        }
    );

    // const res = await api.post<TourSummary[]>(`tours/summary_tours`,
    //     { "tour_codes": tourCodes }
    // );
    console.log(res.data);
    return res.data
}