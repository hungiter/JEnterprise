// app/src/services/tour/TourDetailFetch.ts
import type { RecommendResult, SimilarityResponse } from '@/src/dtos/tour.dto'
import api, { API_AI_BASE } from '../api_info'
import axios from 'axios';

export const fetchSimilarTours = async (tourCode: string): Promise<RecommendResult> => {
  const res = await axios.get<SimilarityResponse>(`${API_AI_BASE}/similar_tour/${tourCode}`, {
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  });
  // const res = await api.get<SimilarityResponse>(`tours/similar_tour/${tourCode}`);
  console.log(res.data);
  const similarity_response = res.data
  return similarity_response.data;
}
