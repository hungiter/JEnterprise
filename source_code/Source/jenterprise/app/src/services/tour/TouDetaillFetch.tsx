// app/src/services/tour/TourDetailFetch.ts
import axios from 'axios'
import type { Tour } from '@/src/dtos/tour.dto'
import { API_TOUR_BASE } from '../api_info'

export const fetchTourByCode = async (tourCode: string): Promise<Tour> => {
  const res = await axios.get<Tour>(`${API_TOUR_BASE}/${tourCode}`);
  console.log(res.data);
  return res.data;
}
