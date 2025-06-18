// export const API_TOUR_BASE = `http://localhost:8080/api/tours`;
// export const API_AI_BASE = `http://localhost:8080/api/ai`;
// export const API_VN_PAY = `http://localhost:8000/api/pay`;

// export const API_TOUR_BASE = `http://localhost:80/api/tours`;
// export const API_AI_BASE = `http://localhost:80/api/ai`;
// export const API_VN_PAY = `http://localhost:80/api/pay`;

import axios from "axios";
import { getCookie } from "./cookies/Cookies";
import { getUserInfoFromCookie } from "../context/LoginContext";
const BASE_URL = "https://ultimately-flowing-stag.ngrok-free.app/api"
export const API_USER_BASE = `${BASE_URL}/users`;
export const API_AUTH_BASE = `${BASE_URL}/auth`;
export const API_TOUR_BASE = `${BASE_URL}/tours`;
export const API_TAG_BASE = `${API_TOUR_BASE}/tags`; // Only using /tags/find?input={input}
export const API_INSTANCE_BASE = `${BASE_URL}/instances`; // Only using /instances/info/{instance_id}
export const API_ENGAGEMENT_BASE = `${BASE_URL}/engagement`; // Only using /engagement/find?username={username}&tour_id={tour_id}
export const API_AI_BASE = `${BASE_URL}/ai`;
export const API_VN_PAY = `${BASE_URL}/pay`;

const api = axios.create({
    baseURL: BASE_URL,
});

// Add token to each request
api.interceptors.request.use((config) => {
    const userInfo = getUserInfoFromCookie();
    if (userInfo) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
        config.headers["Content-Type"] = "application/json";
        config.headers["ngrok-skip-browser-warning"] = "true";
    }
    return config;
});

export default api;