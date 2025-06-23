import { Link } from "react-router-dom";
import { useLogin } from "../context/LoginContext";
import SearchModal from "./header/SearchModal";
import { SearchProvider } from "../context/SearchContext";
import { memo, useCallback } from "react";

interface HeaderProps {
    onLoginClick?: () => void;
}

const Header = memo(function Header() {
    const { setShowLogin, token, logout, isLoggingOut } = useLogin();

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout]);

    const handleLoginClick = useCallback(() => {
        setShowLogin(true);
    }, [setShowLogin]);

    return (
        <nav className="bg-white shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <Link to="/" className="text-xl font-bold text-black">travel✿com.vn</Link>
                <div>
                    <Link to="/tours" className="px-4 text-black">Du lịch trong nước</Link>
                    <Link to="/contact" className="px-4 text-black">Liên hệ</Link>

                    {token ? (
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`px-4 py-1.5 rounded transition cursor-pointer ${
                                isLoggingOut 
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
            <div className="flex justify-center">
                <SearchProvider>
                    <SearchModal />
                </SearchProvider>
            </div>
        </nav>
    );
});

export default Header;