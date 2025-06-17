import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getCookie } from "../services/cookies/Cookies";
import type { LoginResponse, UserInfo } from "../dtos/user.dto";
import api from "../services/api_info";
import { AxiosError } from "axios";

interface LoginContextProps {
    showLogin: boolean;
    setShowLogin: (value: boolean) => void;
    token: string | null;
    setToken: (value: string | null) => void;
    checkLoginAndPrompt: () => void;
    onProcess: boolean;
    setOnProcess: (value: boolean) => void;
}

const LoginContext = createContext<LoginContextProps | undefined>(undefined);

export const useLogin = () => {
    const context = useContext(LoginContext);
    if (!context) throw new Error("useLogin must be used within LoginProvider");
    return context;
};

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>(`auth/login`,
            {
                username,
                password,
            }
        );

        const role = response.data.data?.role;
        const token = response.data.data?.token;
        if (token && role) {
            const userinfo: UserInfo = {
                "username": username,
                "role": role,
                "token": token
            }

            saveUserInfoToCookie(userinfo);
        }

        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            return {
                success: false,
                message: `${error.message}`
            }
        }
        return {
            success: false,
            message: `${error}`
        }
    }
};

const saveUserInfoToCookie = (userInfo: UserInfo) => {
    const cookieName = `accessToken`;
    const cookieValue = encodeURIComponent(JSON.stringify(userInfo));
    console.log(cookieValue);
    document.cookie = `${cookieName}=${cookieValue}; path=/; max-age=86400`;
}

export const getUserInfoFromCookie = (): UserInfo | null => {
    const cookieName = `accessToken`;
    console.log(getCookie(cookieName));
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${cookieName.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}=([^;]*)`)
    );

    if (match) {
        try {
            return JSON.parse(decodeURIComponent(match[1]));
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("Failed to parse UserInfo request from cookie: ", e.message);
            } else {
                console.error("Failed to parse UserInfo request from cookie:\n", e);
            }
        }
    }

    return null;
};


export const LoginProvider = ({ children }: { children: ReactNode }) => {
    const [showLogin, setShowLogin] = useState(false);
    const [onProcess, setOnProcess] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(getCookie("accessToken"))
    })

    const checkLoginAndPrompt = () => {
        const token = localStorage.getItem("token");
        if (!token) setShowLogin(true);
    };

    return (
        <LoginContext.Provider value={{ showLogin, setShowLogin, token, setToken, checkLoginAndPrompt, onProcess, setOnProcess }}>
            {children}
        </LoginContext.Provider>
    );
};
