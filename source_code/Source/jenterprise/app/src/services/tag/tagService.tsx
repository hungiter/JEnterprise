export const searchTagsFromServer = async (keyword: string): Promise<string[]> => {
    // Thay bằng real API call:
    const response = await fetch(`/api/tags/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error("Failed to fetch tags");
    return await response.json(); // giả sử trả về string[]
};
