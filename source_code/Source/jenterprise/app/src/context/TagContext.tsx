import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getListFromCookie, saveListToCookies } from "../services/cookies/Cookies";
import { searchTagsFromServer } from "../services/tag/tagService";
import { AxiosError } from "axios";

interface TagContextProps {
    tags: string[];
    setTags: (value: string[]) => void;
    fetchTagIfNeeded: (keyword: string) => Promise<string[]>;
}

const SearchContext = createContext<TagContextProps | undefined>(undefined);

const useTag = () => {
    const context = useContext(SearchContext);
    if (!context) throw new Error("useTag must be used within TagProvider");
    return context;
};

const TagProvider = ({ children }: { children: ReactNode }) => {
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        const old_tags = getListFromCookie("tags");
        if (old_tags) {
            setTags(old_tags);
        }
    }, [])

    const updateTag = (new_tags: string[]) => {
        // Tạo Set để tránh trùng lặp
        const tagSet = new Set([...tags, ...new_tags]);
        const save_tags = Array.from(tagSet);

        setTags(save_tags);
        saveListToCookies("tags", save_tags);
    };

    const fetchTagIfNeeded = async (keyword: string): Promise<string[]> => {
        try {
            const result = await searchTagsFromServer(keyword); // gọi API
            if (!result || result.length === 0) return [];

            // lọc ra các tag chưa có trong danh sách
            const newTags = result.filter(tag => !tags.includes(tag));
            if (newTags.length > 0) {
                const updatedTags = [...tags, ...newTags];
                updateTag(updatedTags)
            }
            return result;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.log("Lấy tag thất bại: ", error.message);
            } else {
                console.error("Lấy tag thất bại:\n", error);
            }
            return [];
        }
    };

    return (
        <SearchContext.Provider value={{ tags, setTags, fetchTagIfNeeded }}>
            {children}
        </SearchContext.Provider>
    );
};


export { useTag, TagProvider };