import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getCookie, getListFromCookie, saveListToCookies } from "../services/cookies/Cookies";
import { useLogin } from "./LoginContext";
import type { TourEngagement } from "../dtos/tour.dto";

interface EngagementContextProps {
    user: string | null;
    setUser: (value: string | null) => void;
    histories: TourEngagement[];
    setHistories: (value: TourEngagement[]) => void;
}

const EngagementContext = createContext<EngagementContextProps | undefined>(undefined);

const useEngagement = () => {
    const context = useContext(EngagementContext);
    if (!context) throw new Error("useEngagement must be used within EngagementProvider");
    return context;
};

const updateHistory = (new_history: TourEngagement) => {
    const { user, histories, setHistories } = useEngagement();

    if (!user) return;

    const updatedHistories = [...histories];
    const index = updatedHistories.findIndex(
        (item) =>
            item.tourId === new_history.tourId &&
            item.userId === new_history.userId
    );

    if (index !== -1) {
        // Nếu đã tồn tại, thay thế
        updatedHistories[index] = new_history;
    } else {
        // Nếu chưa có, thêm mới
        updatedHistories.push(new_history);
    }

    setHistories(updatedHistories);
    saveListToCookies("histories", updatedHistories);
};



const EngagementProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>("");
    const [histories, setHistories] = useState<TourEngagement[]>([]);
    const { token } = useLogin();

    useEffect(() => {
        setUser(token)
    }, [token])

    return (
        <EngagementContext.Provider value={{ user, setUser, histories, setHistories }}>
            {children}
        </EngagementContext.Provider>
    );
};


export { useEngagement, updateHistory, EngagementProvider };