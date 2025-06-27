import { Link, useLocation } from "react-router-dom";
import { useLogin } from "../context/LoginContext";
import SearchModal from "./header/SearchModal";
import { SearchProvider } from "../context/SearchContext";
import { memo, useCallback, useState, useRef, useEffect } from "react";
import { FaChevronDown, FaUser } from "react-icons/fa";
import { getUserInfoFromCookie } from "../context/LoginContext";

interface HeaderProps {
    onLoginClick?: () => void;
}

const Header = memo(function Header() {
    const { setShowLogin, token, logout, isLoggingOut } = useLogin();
    const [showSupportDropdown, setShowSupportDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const location = useLocation();

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout]);

    const handleLoginClick = useCallback(() => {
        setShowLogin(true);
    }, [setShowLogin]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setShowSupportDropdown(!showSupportDropdown);
        } else if (event.key === 'Escape') {
            setShowSupportDropdown(false);
            buttonRef.current?.focus();
        }
    }, [showSupportDropdown]);

    // Clear timeout when component unmounts
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSupportDropdown(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowSupportDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setShowSupportDropdown(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowSupportDropdown(false);
        }, 150); // Small delay to prevent accidental closing
    };

    const userInfo = getUserInfoFromCookie();

    const supportPages = [
        { path: "/help", label: "Trợ giúp", icon: "❓" },
        { path: "/privacypolicy", label: "Chính sách bảo mật", icon: "🔒" },
        { path: "/termofuse", label: "Điều khoản sử dụng", icon: "📋" },
        { path: "/personaldatapolicy", label: "Chính sách dữ liệu cá nhân", icon: "👤" },
    ];

    // Add AccountInfo page if user is logged in
    const allPages = token && userInfo
        ? [
            ...supportPages,
            { path: "/account", label: "Thông tin tài khoản", icon: "👤" }
        ]
        : supportPages;

    // Check if current location is /tours
    const isOnToursPage = location.pathname === '/tours';

    return (
        <nav className="bg-white shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <Link to="/tours" className="text-xl font-bold text-black">travel✿com.vn</Link>

                    {/* Support Dropdown */}
                    <div
                        className="relative"
                        ref={dropdownRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button
                            ref={buttonRef}
                            onClick={() => setShowSupportDropdown(!showSupportDropdown)}
                            onKeyDown={handleKeyDown}
                            aria-expanded={showSupportDropdown}
                            aria-haspopup="true"
                            aria-controls="support-dropdown"
                            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <span className="text-sm font-medium">Hỗ trợ</span>
                            <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${showSupportDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showSupportDropdown && (
                            <div
                                id="support-dropdown"
                                role="menu"
                                aria-labelledby="support-button"
                                className="absolute top-full left-0 mt-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                                style={{ marginTop: '0px' }}
                            >
                                <div className="py-2">
                                    {allPages.map((page, index) => (
                                        <Link
                                            key={page.path}
                                            to={page.path}
                                            role="menuitem"
                                            tabIndex={0}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:bg-blue-50 focus:text-blue-600"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setShowSupportDropdown(false);
                                                }
                                            }}
                                        >
                                            <span className="text-lg" aria-hidden="true">{page.icon}</span>
                                            <span className="text-sm">{page.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Account Button - Only show when logged in */}
                    {token && userInfo && (
                        <Link
                            to="/account"
                            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <FaUser className="w-4 h-4" />
                            <span className="text-sm font-medium">Tài khoản</span>
                        </Link>
                    )}

                    {token ? (
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`px-4 py-1.5 rounded transition cursor-pointer ${isLoggingOut
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-yellow-400 hover:bg-red-500 text-white'
                                }`}
                        >
                            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                        </button>
                    ) : (
                        <button
                            onClick={handleLoginClick}
                            className="bg-blue-500 hover:bg-green-500 text-white px-4 py-1.5 rounded transition cursor-pointer"
                        >
                            Đăng nhập
                        </button>
                    )}
                </div>
            </div>
            
            {/* Search Bar - Only show on /tours page */}
            {isOnToursPage && (
                <div className="flex justify-center">
                    <SearchProvider>
                        <SearchModal />
                    </SearchProvider>
                </div>
            )}
        </nav>
    );
});

export default Header;