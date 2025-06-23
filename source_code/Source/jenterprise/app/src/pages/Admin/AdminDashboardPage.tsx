import { useAdmin, ADMIN_ROLES } from "../../context/AdminContext";
import { FaUsers, FaChartBar, FaCog, FaShieldAlt, FaPlane, FaCalendarAlt, FaUserPlus, FaPlus, FaCrown, FaStar, FaRocket, FaGem } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminDashboardPage() {
    const { userInfo, isAdmin } = useAdmin();
    const navigate = useNavigate();

    if (!isAdmin) {
        return null; // Nếu không phải admin thì ẩn luôn
    }

    const handleUserManagement = () => {
        navigate('/admin/users');
    };

    const handleTourManagement = () => {
        navigate('/admin/tours');
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section với thiết kế độc đáo */}
            <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200/50 p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <FaCrown className="w-8 h-8 text-gradient-to-r from-purple-600 to-pink-600" />
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Xin chào, {userInfo?.username ?? "Admin"}! 👋
                            </h1>
                        </div>
                        <p className="text-gray-600 text-lg">
                            Chào mừng bạn trở lại với bảng điều khiển quản trị hệ thống
                        </p>
                        <div className="flex items-center space-x-4 mt-4">
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-xl">
                                <FaShieldAlt className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-700 capitalize">
                                    {userInfo?.role?.toLowerCase()}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-xl">
                                <FaStar className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-700">Quản trị viên cao cấp</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                            <FaRocket className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid với thiết kế mới */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                    <div className="flex items-center justify-between">
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-shadow">
                            <FaUsers className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">1,234</p>
                            <p className="text-sm font-medium text-blue-600">+12%</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-lg font-semibold text-gray-800">Tổng người dùng</p>
                        <p className="text-sm text-gray-600">So với tháng trước</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border border-green-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                    <div className="flex items-center justify-between">
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg group-hover:shadow-xl transition-shadow">
                            <FaPlane className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">567</p>
                            <p className="text-sm font-medium text-green-600">+8%</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-lg font-semibold text-gray-800">Tổng tour</p>
                        <p className="text-sm text-gray-600">Tour đang hoạt động</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg border border-yellow-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                    <div className="flex items-center justify-between">
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg group-hover:shadow-xl transition-shadow">
                            <FaCalendarAlt className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">89</p>
                            <p className="text-sm font-medium text-red-600">-3%</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-lg font-semibold text-gray-800">Đơn hàng</p>
                        <p className="text-sm text-gray-600">Trong tháng này</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border border-purple-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                    <div className="flex items-center justify-between">
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-shadow">
                            <FaGem className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">12</p>
                            <p className="text-sm font-medium text-purple-600">Hoạt động</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-lg font-semibold text-gray-800">Quản trị viên</p>
                        <p className="text-sm text-gray-600">Đang online</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions với thiết kế mới */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-200/50 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 mr-4 shadow-lg">
                            <FaUsers className="w-6 h-6 text-white" />
                        </div>
                        Quản lý người dùng
                    </h2>
                    <div className="space-y-4">
                        <button
                            onClick={handleUserManagement}
                            className="w-full text-left p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                        >
                            <div className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 mb-2">Xem danh sách người dùng</div>
                            <div className="text-gray-600">Quản lý tài khoản người dùng và phân quyền hệ thống</div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/users/add', { state: { from: '/admin' } })}
                            className="w-full text-left p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                        >
                            <div className="font-semibold text-lg text-gray-900 group-hover:text-green-600 mb-2 flex items-center space-x-3">
                                <FaUserPlus className="w-5 h-5" />
                                <span>Thêm người dùng mới</span>
                            </div>
                            <div className="text-gray-600">Tạo tài khoản mới cho nhân viên và quản trị viên</div>
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-200/50 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 mr-4 shadow-lg">
                            <FaPlane className="w-6 h-6 text-white" />
                        </div>
                        Quản lý tour
                    </h2>
                    <div className="space-y-4">
                        <button
                            onClick={handleTourManagement}
                            className="w-full text-left p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                        >
                            <div className="font-semibold text-lg text-gray-900 group-hover:text-green-600 mb-2">Quản lý tour</div>
                            <div className="text-gray-600">Xem, thêm, chỉnh sửa và quản lý tất cả tour du lịch</div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/tours/add', { state: { from: '/admin' } })}
                            className="w-full text-left p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                        >
                            <div className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 mb-2 flex items-center space-x-3">
                                <FaPlus className="w-5 h-5" />
                                <span>Thêm tour mới</span>
                            </div>
                            <div className="text-gray-600">Tạo tour du lịch mới với thông tin chi tiết và hình ảnh</div>
                        </button>
                        <button className="w-full text-left p-6 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 transform hover:scale-105 group cursor-pointer">
                            <div className="font-semibold text-lg text-gray-900 group-hover:text-yellow-600 mb-2">Quản lý đặt tour</div>
                            <div className="text-gray-600">Xem và xử lý các đơn đặt tour của khách hàng</div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Role Information với thiết kế mới */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-200/50 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 mr-4 shadow-lg">
                        <FaShieldAlt className="w-6 h-6 text-white" />
                    </div>
                    Thông tin quyền hạn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105 group">
                        <div className="flex items-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 mr-3 shadow-lg">
                                <FaShieldAlt className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Admin</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Quản lý toàn bộ hệ thống, người dùng, tour và các hoạt động hàng ngày của website
                        </p>
                    </div>
                    <div className="p-6 border-2 border-green-200 rounded-2xl hover:border-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-105 group">
                        <div className="flex items-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 mr-3 shadow-lg">
                                <FaUsers className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Guider</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Hướng dẫn viên du lịch, quản lý tour và hỗ trợ khách hàng trong quá trình du lịch
                        </p>
                    </div>
                    <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-105 group">
                        <div className="flex items-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 mr-3 shadow-lg">
                                <FaCog className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">User</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Người dùng thông thường, có thể đặt tour và sử dụng các dịch vụ của website
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 