// app/src/services/tour/TourDetailFetch.ts
import axios from 'axios'
import type { RecommendResult } from '@/src/dtos/tour.dto'
import { API_AI_BASE } from '../api_info'

export const fetchSimilarTours = async (tourCode: string): Promise<RecommendResult> => {
  const res = await axios.get<RecommendResult>(`${API_AI_BASE}/similar_tour/${tourCode}`);
  console.log(res.data);
  return res.data;
}
