import { useAdmin } from "../../context/AdminContext";
import { FaUsers, FaUserPlus, FaArrowLeft, FaSave, FaCrown, FaStar, FaRocket, FaGem } from "react-icons/fa";
import { IoMdReturnLeft } from "react-icons/io";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface AddUserForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
}

export default function AddUserPage() {
    const { userInfo, isAdmin } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState<AddUserForm>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER"
    });
    const [errors, setErrors] = useState<Partial<AddUserForm>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isAdmin) {
        return null;
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<AddUserForm> = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = "Tên người dùng không được để trống";
        } else if (formData.username.length < 3) {
            newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email không được để trống";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Mật khẩu không được để trống";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Implement API call to create user
            console.log("Creating user:", {
                username: formData.username,
                email: formData.email,
                role: formData.role
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Success - redirect to user management
            navigate('/admin/users');
        } catch (error) {
            console.error("Error creating user:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof AddUserForm, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleBackNavigation = () => {
        // Check if there's state with a previous path
        if (location.state?.from) {
            navigate(location.state.from);
        } else {
            // Default to admin dashboard
            navigate('/admin');
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "Admin": return <FaCrown className="w-4 h-4" />;
            case "Guider": return <FaStar className="w-4 h-4" />;
            case "User": return <FaUsers className="w-4 h-4" />;
            default: return <FaUsers className="w-4 h-4" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "Admin": return "from-purple-500 to-pink-500";
            case "Guider": return "from-green-500 to-blue-500";
            case "User": return "from-gray-500 to-gray-600";
            default: return "from-gray-500 to-gray-600";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header với thiết kế độc đáo */}
            <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200/50 p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={handleBackNavigation}
                            className="group flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-2 border-transparent hover:border-blue-200 cursor-pointer transform hover:scale-105"
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
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 mr-4 shadow-lg">
                                    <FaUserPlus className="w-6 h-6 text-white" />
                                </div>
                                Thêm người dùng mới
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form với thiết kế mới */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-200/50 p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Username */}
                    <div className="group">
                        <label htmlFor="username" className="block text-lg font-semibold text-gray-800 mb-3">
                            Tên người dùng *
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className={`w-full px-4 py-4 text-black border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${errors.username ? 'border-red-500' : 'border-gray-200 group-hover:border-blue-300'
                                }`}
                            placeholder="Nhập tên người dùng"
                        />
                        {errors.username && (
                            <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="group">
                        <label htmlFor="email" className="block text-lg font-semibold text-gray-800 mb-3">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-4 py-4 text-black border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${errors.email ? 'border-red-500' : 'border-gray-200 group-hover:border-blue-300'
                                }`}
                            placeholder="Nhập địa chỉ email"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="group">
                        <label htmlFor="password" className="block text-lg font-semibold text-gray-800 mb-3">
                            Mật khẩu *
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={`w-full px-4 py-4 text-black border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${errors.password ? 'border-red-500' : 'border-gray-200 group-hover:border-blue-300'
                                }`}
                            placeholder="Nhập mật khẩu"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="group">
                        <label htmlFor="confirmPassword" className="block text-lg font-semibold text-gray-800 mb-3">
                            Xác nhận mật khẩu *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`w-full px-4 py-4 text-black border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 group-hover:border-blue-300'
                                }`}
                            placeholder="Nhập lại mật khẩu"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="group">
                        <label htmlFor="role" className="block text-lg font-semibold text-gray-800 mb-3">
                            Vai trò *
                        </label>
                        <div className="relative">
                            <select
                                id="role"
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                className="w-full px-4 py-4 text-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none cursor-pointer group-hover:border-blue-300"
                            >
                                <option value="User">User</option>
                                <option value="Guider">Guider</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${getRoleColor(formData.role)} shadow-lg`}>
                                    {getRoleIcon(formData.role)}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${getRoleColor(formData.role)} shadow-lg`}>
                                    {getRoleIcon(formData.role)}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800 capitalize">{formData.role.toLowerCase()}</div>
                                    <div className="text-sm text-gray-600">
                                        {formData.role === "Admin" && "Quản lý toàn bộ hệ thống"}
                                        {formData.role === "Guider" && "Hướng dẫn viên du lịch"}
                                        {formData.role === "User" && "Người dùng thông thường"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-8 border-t-2 border-blue-200/50">
                        <button
                            type="button"
                            onClick={handleBackNavigation}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 cursor-pointer transform hover:scale-105"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center px-6 py-3 rounded-xl text-white transition-all duration-300 cursor-pointer transform hover:scale-105 ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                    <span className="font-semibold">Đang tạo...</span>
                                </>
                            ) : (
                                <>
                                    <FaSave className="w-5 h-5 mr-3" />
                                    <span className="font-semibold">Tạo người dùng</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 