import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getCookie, getListFromCookie, saveListToCookies } from "../services/cookies/Cookies";
import { useLogin } from "./LoginContext";
import type { TourEngagement } from "../dtos/tour.dto";

interface SearchContextProps {
    user: string | null;
    setUser: (value: string | null) => void;
    tags: string[];
    setTags: (value: string[]) => void;
    histories: TourEngagement[];
    setHistories: (value: TourEngagement[]) => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const useTag = () => {
    const context = useContext(SearchContext);
    if (!context) throw new Error("useTag must be used within TagProvider");
    return context;
};

export const updateTag = (new_tags: string[]) => {
    const { tags, setTags } = useTag();
    const save_tags = [...tags, ...new_tags]; // gộp mảng
    setTags(save_tags);
    saveListToCookies("tags", save_tags)
}

export const updateHistory = (new_history: TourEngagement) => {
    const { user, histories, setHistories } = useTag();

    let user_histories: TourEngagement[] = [new_history]
    if (user) {
        user_histories = [];
    }

    const save_histories = [...histories, ...user_histories]; // gộp mảng
    setHistories(save_histories);
    saveListToCookies("histories", save_histories)
}


export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>("");
    const [tags, setTags] = useState<string[]>([]);
    const [histories, setHistories] = useState<TourEngagement[]>([]);
    const { token } = useLogin();

    useEffect(() => {
        const old_tags = getListFromCookie("tags");
        if (old_tags) {
            setTags(old_tags);
        }
    }, [])
    useEffect(() => {
        setUser(token)
    }, [token])

    return (
        <SearchContext.Provider value={{ user, setUser, tags, setTags, histories, setHistories }}>
            {children}
        </SearchContext.Provider>
    );
};
