import { useAdmin } from "../../context/AdminContext";
import { FaUsers, FaUserPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaCrown, FaStar, FaRocket, FaGem, FaFilter } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdReturnLeft } from "react-icons/io";

// Mock data for demonstration
const mockUsers = [
    { id: 1, username: "admin", email: "admin@travel.com", role: "Admin", status: "active", lastLogin: "2024-01-15" },
    { id: 2, username: "guider1", email: "guider1@travel.com", role: "Guider", status: "active", lastLogin: "2024-01-14" },
    { id: 3, username: "guider2", email: "guider2@travel.com", role: "Guider", status: "active", lastLogin: "2024-01-13" },
    { id: 4, username: "user1", email: "user1@travel.com", role: "User", status: "inactive", lastLogin: "2024-01-10" },
    { id: 5, username: "user2", email: "user2@travel.com", role: "User", status: "active", lastLogin: "2024-01-12" },
];

export default function UserManagementPage() {
    const { userInfo, isAdmin } = useAdmin();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");

    if (!isAdmin) {
        return null;
    }

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === "all" || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "Admin": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg";
            case "Guider": return "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg";
            case "User": return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg";
            default: return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg";
        }
    };

    const getStatusBadgeColor = (status: string) => {
        return status === "active"
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
            : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg";
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "Admin": return <FaCrown className="w-4 h-4" />;
            case "Guider": return <FaStar className="w-4 h-4" />;
            case "User": return <FaUsers className="w-4 h-4" />;
            default: return <FaUsers className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header với thiết kế độc đáo */}
            <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200/50 p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => navigate('/admin')}
                            className="group flex items-center space-x-3 px-4 py-3 text-gray-600  hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-2 border-gray-200 hover:border-blue-200 cursor-pointer transform hover:scale-105"
                        >
                            <div className="hidden md:flex items-center space-x-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                                    <FaArrowLeft className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <span className="font-semibold text-base">Quay lại</span>
                            </div>
                            <div className="flex md:hidden">
                                <IoMdReturnLeft className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </button>
                        <div className="flex items-center">
                            <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full mr-4"></div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 mr-4 shadow-lg">
                                    <FaUsers className="w-6 h-6 text-white" />
                                </div>
                                Quản lý người dùng
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/admin/users/add', { state: { from: '/admin/users' } })}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                    >
                        <div className="hidden md:flex items-center space-x-3">
                            <FaUserPlus className="w-5 h-5" />
                            <span className="font-semibold">Thêm người dùng</span>
                        </div>
                        <div className="flex md:hidden">
                            <FaUserPlus className="w-6 h-6" />
                        </div>
                    </button>
                </div>
            </div>

            {/* Filters với thiết kế mới */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-200/50 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative group">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-4 py-4 text-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        />
                    </div>
                    <div className="relative group">
                        <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full pl-8 pr-4 py-4 text-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none cursor-pointer"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="Admin">Admin</option>
                            <option value="Guider">Guider</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-4 rounded-xl border border-blue-200/50">
                            <div className="text-lg font-bold text-gray-800">Tổng: {filteredUsers.length}</div>
                            <div className="text-sm text-gray-600">người dùng</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table - Mobile Cards với thiết kế mới */}
            <div className="md:hidden space-y-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                    {getRoleIcon(user.role)}
                                </div>
                                <div className="ml-4">
                                    <div className="font-bold text-lg text-gray-900">{user.username}</div>
                                    <div className="text-sm text-gray-600">{user.email}</div>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button className="text-blue-600 hover:text-blue-800 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-110">
                                    <FaEdit className="w-5 h-5" />
                                </button>
                                <button className="text-red-600 hover:text-red-800 cursor-pointer p-2 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-110">
                                    <FaTrash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 font-medium">Vai trò:</span>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                        {getRoleIcon(user.role)}
                                        <span className="ml-1">{user.role}</span>
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Trạng thái:</span>
                                <div className="mt-1">
                                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeColor(user.status)}`}>
                                        {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                            <span className="font-medium">Đăng nhập cuối:</span> {user.lastLogin}
                        </div>
                    </div>
                ))}
            </div>

            {/* Users Table - Desktop với thiết kế mới */}
            <div className="hidden md:block bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200/50">
                        <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <tr>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Vai trò
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Đăng nhập cuối
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                                                {getRoleIcon(user.role)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {user.username}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleIcon(user.role)}
                                            <span className="ml-1">{user.role}</span>
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeColor(user.status)}`}>
                                            {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-medium">
                                        {user.lastLogin}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-3">
                                            <button className="text-blue-600 hover:text-blue-800 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-110">
                                                <FaEdit className="w-5 h-5" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 cursor-pointer p-2 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-110">
                                                <FaTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}