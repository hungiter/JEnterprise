import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useTag } from "./TagContext";
import type { TourSummary } from "../dtos/tour.dto";
import { fetchSummaryToursByTags } from "../services/tour/SummaryToursFetch";
import { AxiosError } from "axios";

interface SearchContextProps {
    onFocus: boolean,
    setOnFocus: (value: boolean) => void;
    onSearchTour: boolean,
    onSearchTag: boolean,
    input: string;
    setInput: (value: string) => void;
    searchTags: string[];
    selectedTags: string[];
    addSelectedTag: (tag: string) => void;
    removeSelectedTag: (tag: string) => void;
    startSearching: (onFinish: (tags: string[]) => void) => void;
    onNavigate: boolean;
    searchResult: TourSummary[],
    loading: boolean;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) throw new Error("useSearch must be used within SearchProvider");
    return context;
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [onFocus, setOnFocus] = useState<boolean>(false);
    const [onSearchTour, setOnSearchTour] = useState<boolean>(false);
    const [onSearchTag, setOnSearchTag] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [searchTags, setSearchTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [onNavigate, setOnNavigate] = useState<boolean>(false);
    const [searchResult, setSearchResult] = useState<TourSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchedCache = useRef<Map<string, string[]>>(new Map());
    const { tags, fetchTagIfNeeded } = useTag();
    const keySearch = useRef<string | null>(null);
    const keyPending = useRef<string | null>(null);

    const getCombinedTags = useCallback(() => {
        return [...selectedTags, input.trim()];
    }, [selectedTags, input]);

    const fetchingTag = useCallback(async () => {
        // Get valid tags
        const keyword = input.trim();
        if (keySearch.current == keyword) {
            return;
        }
        keySearch.current = keyword;

        if (!keyword) {
            setSearchTags([]);
            setOnSearchTag(false);
            return;
        }

        // Bỏ qua nếu tag đã chọn rồi
        const filteredLocal = tags.filter(tag =>
            keySearch.current != null &&
            (tag.includes(keySearch.current)
                || tag.toLowerCase().includes(keySearch.current.toLowerCase()))
        );

        if (filteredLocal.length > 0) {
            setSearchTags(filteredLocal);
            setOnSearchTag(false);
            return;
        }

        // Nếu chưa có trong local và chưa fetch trước đó
        if (!fetchedCache.current.has(keyword)) {
            let fetched: string[] = [];
            try {
                fetched = await fetchTagIfNeeded(keyword);
                const filteredFetched = fetched.filter(tag =>
                    keySearch.current != null &&
                    (tag.includes(keySearch.current)
                        || tag.toLowerCase().includes(keySearch.current.toLowerCase()))
                );
                setSearchTags(filteredFetched);
                fetchedCache.current.set(keyword, filteredFetched);
            } catch (error: unknown) {
                if (error instanceof AxiosError) {
                    console.log("Lấy tag thất bại: ", error.message);
                } else {
                    console.error("Lấy tag thất bại:\n", error);
                }
            } finally {
                if (fetched.length === 0 && keySearch.current) {
                    fetchedCache.current.delete(keyword);
                    const newTags = [keySearch.current];
                    setSearchTags(newTags);
                    console.log("Search keys:", keySearch.current);
                    console.log("New search tags:", newTags.join(","));
                } else {
                    console.log("Tag fetched: ", fetched.join(","));
                }
                setOnSearchTag(false);
            }
        } else {
            // Use cached data
            const cachedTags = fetchedCache.current.get(keyword) || [];
            const filteredCached = cachedTags.filter(tag =>
                !selectedTags.includes(tag)
            );
            setSearchTags(filteredCached);
            setOnSearchTag(false);
        }
    }, [input, tags, selectedTags, fetchTagIfNeeded, searchTags]);

    const searchByTags = useCallback(async () => {
        if (selectedTags.length === 0) {
            setSearchResult([]);
            setOnSearchTour(false);
            return;
        }

        try {
            const combined = getCombinedTags();
            const tours = await fetchSummaryToursByTags(combined);
            setSearchResult(tours);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.log("Tìm kiếm tour thất bại: ", error.message);
            } else {
                console.error("Tìm kiếm tour thất bại:\n", error);
            }
            setSearchResult([]);
        } finally {
            setOnSearchTour(false);
        }
    }, [selectedTags, getCombinedTags]);

    const fetchAll = useCallback(async () => {
        await Promise.all([fetchingTag(), searchByTags()]);
        // if (keySearch.current == null) {
        //     console.log("Finished fetching");
        // }
    }, [fetchingTag, searchByTags]);

    useEffect(() => {
        if (keySearch.current == input.trim().toLowerCase()) {
            return;
        }

        if (keyPending.current == input.trim().toLowerCase()) {
            return;
        } else {
            keyPending.current = input.trim().toLowerCase();
        }

        if (onSearchTag || onSearchTour) {
            return;
        }

        keySearch.current = null;
        setOnSearchTag(true);
        setOnSearchTour(true);
        fetchAll();
    }, [input, tags, selectedTags, fetchAll, onSearchTag, onSearchTour]);

    useEffect(() => {
        setLoading(onSearchTag && onSearchTour);
    }, [onSearchTag, onSearchTour]);

    useEffect(() => {
        if (keyPending.current === keySearch.current) {
            keyPending.current = null;
        }

        if (keyPending.current != null) {
            setOnSearchTag(true);
            setOnSearchTour(true);
            fetchAll();
        }
    }, [loading, fetchAll]);

    const addSelectedTag = useCallback((tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags(prev => [...prev, tag]);
        }
        setInput("");
        setSearchTags([]);
    }, [selectedTags]);

    const removeSelectedTag = useCallback((tag: string) => {
        setSelectedTags(prev => prev.filter(t => t !== tag));
    }, []);

    const startSearching = useCallback((onFinish: (tags: string[]) => void) => {
        setOnNavigate(true);
        console.log("Start Combined tag for navigate.");
        const combinedTags = getCombinedTags();
        console.log("Tags: " + combinedTags);
        setOnNavigate(false);
        onFinish(combinedTags);
    }, [getCombinedTags]);

    return (
        <SearchContext.Provider value={{
            onFocus, setOnFocus,
            onSearchTour, onSearchTag,
            input, setInput,
            searchTags,
            selectedTags,
            addSelectedTag, removeSelectedTag, startSearching,
            onNavigate,
            searchResult,
            loading
        }}>
            {children}
        </SearchContext.Provider>
    );
};
