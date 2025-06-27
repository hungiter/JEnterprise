// app/src/services/tour/TourService.ts
import type { TourSummary } from '@/src/dtos/tour.dto'
import api, { API_TOUR_BASE } from '../api_info'
import axios, { AxiosError } from 'axios';

function isTourSummary(obj: any): obj is TourSummary {
    return typeof obj.tour_code === 'string'
}

export const fetchAllTourSummaries = async (): Promise<TourSummary[]> => {
    let data: TourSummary[] = [];
    try {
        const res = await axios.get<TourSummary[]>(`${API_TOUR_BASE}/summary`, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        data = res.data;

        if (!Array.isArray(data) || !data.every(isTourSummary)) {
            throw new Error("Invalid data format: Not a valid TourSummary array");
        } else {
            // console.log(data);
            return data
        }
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Lấy danh sách tour thất bại: ${error.message}`)
        } else {
            console.error(`Lấy danh sách tour thất bại:\n${error}`)
        }
        return data;
    }
}

