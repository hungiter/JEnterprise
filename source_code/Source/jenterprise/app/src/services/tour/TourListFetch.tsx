// app/src/services/tour/TourService.ts
import axios from 'axios'
import type { TourSummary } from '@/src/dtos/tour.dto'
import { API_TOUR_BASE } from '../api_info'

export const fetchAllTourSummaries = async (): Promise<TourSummary[]> => {
    const res = await axios.get<TourSummary[]>(`${API_TOUR_BASE}/summary`)
    console.log(res.data);
    return res.data
}