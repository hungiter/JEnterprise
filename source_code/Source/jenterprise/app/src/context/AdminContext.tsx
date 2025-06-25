import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserInfoFromCookie, useLogin } from "./LoginContext";
import type { UserInfo } from "../dtos/user.dto";

interface AdminContextProps {
    // Admin protection state
    isAdmin: boolean;
    isLoading: boolean;
    userInfo: UserInfo | null;

    // Admin check functions
    checkAdminAccess: () => boolean;
    requireAdmin: () => void;

    // Redirect functions
    redirectToLogin: () => void;
    redirectToHome: () => void;
    redirectToAccessDenied: () => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error("useAdmin must be used within AdminProvider");
    return context;
};

// Admin role constants
export const ADMIN_ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    MODERATOR: "MODERATOR"
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

// Check if user has admin role
export const hasAdminRole = (role: string): boolean => {
    return Object.values(ADMIN_ROLES).includes(role as AdminRole);
};

// Check if user has specific admin role
export const hasSpecificAdminRole = (userRole: string, requiredRole: AdminRole): boolean => {
    const roleHierarchy = {
        [ADMIN_ROLES.SUPER_ADMIN]: 3,
        [ADMIN_ROLES.ADMIN]: 2,
        [ADMIN_ROLES.MODERATOR]: 1
    };

    const userLevel = roleHierarchy[userRole as AdminRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { setShowLogin } = useLogin();

    // Check admin access
    const checkAdminAccess = (): boolean => {
        const currentUserInfo = getUserInfoFromCookie();

        if (!currentUserInfo) {
            setIsAdmin(false);
            setUserInfo(null);
            return false;
        }

        const hasAccess = hasAdminRole(currentUserInfo.role);
        setIsAdmin(hasAccess);
        setUserInfo(currentUserInfo);

        return hasAccess;
    };

    // Require admin access - redirects if not admin
    const requireAdmin = () => {
        if (!checkAdminAccess()) {
            redirectToAccessDenied();
        }
    };

    // Redirect functions
    const redirectToLogin = () => {
        setShowLogin(true);
    };

    const redirectToHome = () => {
        navigate('/', {
            state: {
                message: "Bạn không có quyền truy cập trang quản trị"
            }
        });
    };

    const redirectToAccessDenied = () => {
        navigate('/access-denied', {
            state: {
                from: location.pathname,
                message: "Bạn không có quyền truy cập trang này"
            }
        });
    };

    // Initialize admin check on mount and route changes
    useEffect(() => {
        setIsLoading(true);
        // const hasAccess = checkAdminAccess();
        // LOOKING FOR THIS TEST DATA BEFORE RELEASE
        const hasAccess = true;
        setIsAdmin(hasAccess);
        setUserInfo({ "username": "admin", "email": "admin@gmail.com", "role": "admin", "token": "1234567890" });
        setIsLoading(false);

        // If trying to access admin routes without proper role, redirect
        if (location.pathname.startsWith('/admin') && !hasAccess) {
            redirectToAccessDenied();
        }
    }, [location.pathname]);

    const contextValue: AdminContextProps = {
        isAdmin,
        isLoading,
        userInfo,
        checkAdminAccess,
        requireAdmin,
        redirectToLogin,
        redirectToHome,
        redirectToAccessDenied
    };

    return (
        <AdminContext.Provider value={contextValue}>
            {children}
        </AdminContext.Provider>
    );
};

// Higher-order component for protecting admin routes
export const withAdminProtection = <P extends object>(
    Component: React.ComponentType<P>,
    requiredRole?: AdminRole
) => {
    return (props: P) => {
        const { isAdmin, isLoading, userInfo, redirectToAccessDenied } = useAdmin();

        if (isLoading) {
            return (
                <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-sky-100 to-sky-300">
                    <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-xl">
                        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sky-600 font-semibold">Đang kiểm tra quyền truy cập...</p>
                    </div>
                </div>
            );
        }

        if (!isAdmin) {
            redirectToAccessDenied();
            return null;
        }

        if (requiredRole && userInfo && !hasSpecificAdminRole(userInfo.role, requiredRole)) {
            redirectToAccessDenied();
            return null;
        }

        return <Component {...props} />;
    };
};

// Hook for admin route protection
export const useAdminRoute = (requiredRole?: AdminRole) => {
    const { isAdmin, isLoading, userInfo, redirectToAccessDenied } = useAdmin();

    useEffect(() => {
        if (!isLoading) {
            if (!isAdmin) {
                redirectToAccessDenied();
                return;
            }

            if (requiredRole && userInfo && !hasSpecificAdminRole(userInfo.role, requiredRole)) {
                redirectToAccessDenied();
                return;
            }
        }
    }, [isAdmin, isLoading, userInfo, requiredRole, redirectToAccessDenied]);

    return { isAdmin, isLoading, userInfo };
}; 