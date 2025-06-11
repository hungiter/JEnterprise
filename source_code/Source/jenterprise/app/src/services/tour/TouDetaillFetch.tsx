// app/src/services/tour/TourDetailFetch.ts
import axios from 'axios'
import type { Tour } from '@/src/dtos/tour.dto'
import { API_TOUR_BASE } from '../api_info'

function isTour(obj: any): obj is Tour {
  return typeof obj.tourCode === 'string'
}

export const fetchTourByCode = async (tourCode: string): Promise<Tour> => {
  const res = await axios.get<Tour>(`${API_TOUR_BASE}/${tourCode}`, {
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  });
  const data = res.data;

  if (!isTour(data)) {
    console.log("Invalid data format: Not a valid Tour object");
    throw new Error("Invalid data format: Not a valid Tour object");
  } else {
    console.log(data);
    return data;
  }
}
