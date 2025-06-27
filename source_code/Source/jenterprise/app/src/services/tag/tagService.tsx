import axios from "axios";
import { API_TAG_BASE } from "../api_info";


// response body {success: true, message: 'Tìm thấy từ khoá phù hợp', tags: Array(4420)}
// => create object handle response
interface TagResponse {
    success: boolean;
    message: string;
    tags: string[];
}
export const searchTagsFromServer = async (keyword: string): Promise<string[]> => {
    // Thay bằng real API call:
    const res = await axios.get<TagResponse>(`${API_TAG_BASE}/find?input=${keyword}`,
        {
            headers: {
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "true"
            }
        }
    );
    return res.data.tags;
};
