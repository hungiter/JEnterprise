import { Outlet } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { useLogin } from "../context/LoginContext";
import { Link, useLocation } from "react-router-dom";
import { FaShieldAlt, FaUsers, FaChartBar, FaCog, FaSignOutAlt, FaHome, FaPlane, FaBars, FaTimes, FaCrown, FaStar } from "react-icons/fa";
import LoginRegisterModal from "../components/header/LoginRegisterModal";
import { useCallback, useState } from "react";
import { LoginProvider } from "../context/LoginContext";
import { AdminProvider } from "../context/AdminContext";
import { ToastProvider } from "../context/ToastContext";

function AdminLayoutContent() {
    const { userInfo, isAdmin } = useAdmin();
    const { logout, isLoggingOut } = useLogin();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout]);

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    if (!isAdmin) {
        return null; // This will be handled by the AdminProvider
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header với thiết kế độc đáo */}
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo và menu chính - bên trái */}
                        <div className="flex items-center space-x-8">
                            {/* Logo với hiệu ứng đẹp */}
                            <div className="flex-shrink-0">
                                <Link to="/admin" className="flex items-center group">
                                    <div className="relative">
                                        <FaCrown className="w-8 h-8 text-gradient-to-r from-purple-600 to-pink-600" />
                                        <FaStar className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                                    </div>
                                    <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-pink-600 group-hover:to-purple-600 transition-all duration-300">
                                        Control Center
                                    </span>
                                </Link>
                            </div>

                            {/* Menu chính - chỉ hiện trên desktop */}
                            <nav className="hidden md:flex space-x-1">
                                <Link
                                    to="/admin"
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${isActive('/admin')
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <FaChartBar className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/admin/users"
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${isActive('/admin/users')
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <FaUsers className="w-4 h-4 mr-2" />
                                    Users
                                </Link>
                                <Link
                                    to="/admin/tours"
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${isActive('/admin/tours')
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <FaPlane className="w-4 h-4 mr-2" />
                                    Tours
                                </Link>
                            </nav>
                        </div>

                        {/* Bên phải - thông tin user và actions */}
                        <div className="flex items-center space-x-4">
                            {/* Thông tin user - chỉ hiện khi không ở dashboard */}
                            {!isActive('/admin') && (
                                <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-200/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-md">
                                        <FaShieldAlt className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">
                                            <span className="text-blue-600">Xin chào, </span>
                                            <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{userInfo?.username ?? "Admin"}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Các nút action - chỉ hiện trên desktop */}
                            <div className="hidden md:flex items-center space-x-2">
                                <Link
                                    to="/"
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-105"
                                    title="Về trang chính"
                                >
                                    <FaHome className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${isLoggingOut
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                        }`}
                                    title={isLoggingOut ? "Đang thoát..." : "Thoát hệ thống"}
                                >
                                    {isLoggingOut ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-red-600 border-solid"></div>
                                    ) : (
                                        <FaSignOutAlt className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            {/* Nút menu mobile - chỉ hiện trên mobile */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden flex items-center p-2 text-gray-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-110"
                            >
                                {isMobileMenuOpen ? (
                                    <FaTimes className="w-5 h-5" />
                                ) : (
                                    <FaBars className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Menu mobile - slide down đẹp mắt */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-blue-200/50 py-4 bg-white/90 backdrop-blur-sm rounded-b-xl shadow-lg">
                            <div className="space-y-2">
                                {/* Menu chính */}
                                <Link
                                    to="/admin"
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${isActive('/admin')
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <FaChartBar className="w-4 h-4 mr-3" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/admin/users"
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${isActive('/admin/users')
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <FaUsers className="w-4 h-4 mr-3" />
                                    Users
                                </Link>
                                <Link
                                    to="/admin/tours"
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${isActive('/admin/tours')
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <FaPlane className="w-4 h-4 mr-3" />
                                    Tours
                                </Link>
                            </div>

                            {/* Thông tin user trên mobile */}
                            <div className="mt-4 pt-4 border-t border-blue-200/50">
                                {!isActive('/admin') && (
                                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-md">
                                            <FaShieldAlt className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">
                                                <span className="text-blue-600">Xin chào, </span>
                                                <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{userInfo?.username ?? "Admin"}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Các nút action trên mobile */}
                                <div className="space-y-2">
                                    <Link
                                        to="/"
                                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <FaHome className="w-4 h-4 mr-3" />
                                        Về Trang Chủ
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${isLoggingOut
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                            }`}
                                    >
                                        {isLoggingOut ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-red-600 border-solid mr-3"></div>
                                                <span>Đang đăng xuất...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaSignOutAlt className="w-4 h-4 mr-3" />
                                                <span>Đăng Xuất</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Nội dung chính - với padding và background đẹp */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Modal đăng nhập cho admin */}
            <LoginRegisterModal />
        </div>
    );
}

export default function AdminLayout() {
    return (
        <ToastProvider>
            <LoginProvider>
                <AdminProvider>
                    <AdminLayoutContent />
                </AdminProvider>
            </LoginProvider>
        </ToastProvider>
    );
} 