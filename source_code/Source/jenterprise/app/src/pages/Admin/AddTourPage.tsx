import { useAdmin } from "../../context/AdminContext";
import { FaPlane, FaPlus, FaArrowLeft, FaSave, FaCalendarAlt, FaMapMarkerAlt, FaCar, FaRocket } from "react-icons/fa";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdReturnLeft } from "react-icons/io";

interface AddTourForm {
    tourCode: string;
    title: string;
    departure: string;
    duration: string;
    vehicle: string;
    price: string;
    tag: string;
    sightseeing_spots: string;
    cuisine: string;
    suitable_customers: string;
    ideal_times: string;
    vehicles: string;
}

export default function AddTourPage() {
    const { userInfo, isAdmin } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState<AddTourForm>({
        tourCode: "",
        title: "",
        departure: "",
        duration: "",
        vehicle: "",
        price: "",
        tag: "",
        sightseeing_spots: "",
        cuisine: "",
        suitable_customers: "",
        ideal_times: "",
        vehicles: ""
    });
    const [errors, setErrors] = useState<Partial<AddTourForm>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isAdmin) {
        return null;
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<AddTourForm> = {};

        // Tour code validation
        if (!formData.tourCode.trim()) {
            newErrors.tourCode = "Mã tour không được để trống";
        }

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = "Tên tour không được để trống";
        }

        // Departure validation
        if (!formData.departure.trim()) {
            newErrors.departure = "Điểm khởi hành không được để trống";
        }

        // Duration validation
        if (!formData.duration.trim()) {
            newErrors.duration = "Thời gian không được để trống";
        }

        // Price validation
        if (!formData.price.trim()) {
            newErrors.price = "Giá không được để trống";
        } else if (isNaN(Number(formData.price.replace(/,/g, '')))) {
            newErrors.price = "Giá phải là số hợp lệ";
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
            // TODO: Implement API call to create tour
            console.log("Creating tour:", formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Success - redirect to tour management
            navigate('/admin/tours');
        } catch (error) {
            console.error("Error creating tour:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof AddTourForm, value: string) => {
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

    return (
        <div className="space-y-8">
            {/* Header với thiết kế độc đáo */}
            <div className="bg-gradient-to-r from-white via-green-50 to-blue-50 rounded-2xl shadow-xl border border-green-200/50 p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={handleBackNavigation}
                            className="group flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-green-600 transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 border-2 border-transparent hover:border-green-200 cursor-pointer transform hover:scale-105"
                        >
                            <div className="hidden md:flex items-center space-x-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-green-100 group-hover:to-blue-100 transition-all duration-300">
                                    <FaArrowLeft className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <span className="font-semibold text-base">Quay lại</span>
                            </div>
                            <div className="flex md:hidden">
                                <IoMdReturnLeft className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </button>
                        <div className="flex items-center">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-blue-600 rounded-full mr-4"></div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 mr-4 shadow-lg">
                                    <FaPlus className="w-6 h-6 text-white" />
                                </div>
                                Thêm tour mới
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form với thiết kế mới */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-200/50 p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Tour Code */}
                        <div className="group">
                            <label htmlFor="tourCode" className="block text-lg font-semibold text-gray-800 mb-3">
                                Mã tour *
                            </label>
                            <input
                                type="text"
                                id="tourCode"
                                value={formData.tourCode}
                                onChange={(e) => handleInputChange('tourCode', e.target.value)}
                                className={`w-full px-4 py-4 !text-black !placeholder-black border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${errors.tourCode ? 'border-red-500' : 'border-gray-200 group-hover:border-green-300'}`}
                                placeholder="VD: DN-HA-001"
                            />
                            {errors.tourCode && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{errors.tourCode}</p>
                            )}
                        </div>
                        {/* Title */}
                        <div className="group">
                            <label htmlFor="title" className="block text-lg font-semibold text-gray-800 mb-3">
                                Tên tour *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className={`w-full px-4 py-4 !text-black !placeholder-black border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${errors.title ? 'border-red-500' : 'border-gray-200 group-hover:border-green-300'}`}
                                placeholder="Tên tour du lịch"
                            />
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{errors.title}</p>
                            )}
                        </div>
                        {/* Departure */}
                        <div className="group">
                            <label htmlFor="departure" className="block text-lg font-semibold text-gray-800 mb-3">
                                Điểm khởi hành *
                            </label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                                <input
                                    type="text"
                                    id="departure"
                                    value={formData.departure}
                                    onChange={(e) => handleInputChange('departure', e.target.value)}
                                    className={`w-full pl-12 pr-4 py-4 !text-black !placeholder-black border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${errors.departure ? 'border-red-500' : 'border-gray-200 group-hover:border-green-300'}`}
                                    placeholder="Điểm khởi hành"
                                />
                            </div>
                            {errors.departure && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{errors.departure}</p>
                            )}
                        </div>
                        {/* Duration */}
                        <div className="group">
                            <label htmlFor="duration" className="block text-lg font-semibold text-gray-800 mb-3">
                                Thời gian *
                            </label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                                <input
                                    type="text"
                                    id="duration"
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange('duration', e.target.value)}
                                    className={`w-full pl-12 pr-4 py-4 !text-black !placeholder-black border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${errors.duration ? 'border-red-500' : 'border-gray-200 group-hover:border-green-300'}`}
                                    placeholder="VD: 3 ngày 2 đêm"
                                />
                            </div>
                            {errors.duration && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{errors.duration}</p>
                            )}
                        </div>
                        {/* Vehicle */}
                        <div className="group">
                            <label htmlFor="vehicle" className="block text-lg font-semibold text-gray-800 mb-3">
                                Phương tiện
                            </label>
                            <div className="relative">
                                <FaCar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                                <input
                                    type="text"
                                    id="vehicle"
                                    value={formData.vehicle}
                                    onChange={(e) => handleInputChange('vehicle', e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 !text-black !placeholder-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-green-300"
                                    placeholder="VD: Ô tô, Máy bay"
                                />
                            </div>
                        </div>
                        {/* Price */}
                        <div className="group">
                            <label htmlFor="price" className="block text-lg font-semibold text-gray-800 mb-3">
                                Giá (VNĐ) *
                            </label>
                            <input
                                type="text"
                                id="price"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                className={`w-full px-4 py-4 !text-black !placeholder-black border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${errors.price ? 'border-red-500' : 'border-gray-200 group-hover:border-green-300'}`}
                                placeholder="VD: 2,500,000"
                            />
                            {errors.price && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{errors.price}</p>
                            )}
                        </div>
                    </div>
                    {/* Tag */}
                    <div className="group">
                        <label htmlFor="tag" className="block text-lg font-semibold text-gray-800 mb-3">
                            Tag
                        </label>
                        <input
                            type="text"
                            id="tag"
                            value={formData.tag}
                            onChange={(e) => handleInputChange('tag', e.target.value)}
                            className="w-full px-4 py-4 !text-black !placeholder-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-green-300"
                            placeholder="VD: Phổ biến, Khuyến mãi"
                        />
                    </div>
                    {/* Tour Details */}
                    <div className="border-t-2 border-green-200/50 pt-8">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center mb-6">
                            <FaRocket className="w-6 h-6 mr-3 text-green-500" />
                            Chi tiết tour
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Sightseeing Spots */}
                            <div className="group">
                                <label htmlFor="sightseeing_spots" className="block text-lg font-semibold text-gray-800 mb-3">
                                    Điểm tham quan
                                </label>
                                <textarea
                                    id="sightseeing_spots"
                                    value={formData.sightseeing_spots}
                                    onChange={(e) => handleInputChange('sightseeing_spots', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-4 !text-black !placeholder-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-green-300"
                                    placeholder="Mô tả các điểm tham quan"
                                />
                            </div>
                            {/* Cuisine */}
                            <div className="group">
                                <label htmlFor="cuisine" className="block text-lg font-semibold text-gray-800 mb-3">
                                    Ẩm thực
                                </label>
                                <textarea
                                    id="cuisine"
                                    value={formData.cuisine}
                                    onChange={(e) => handleInputChange('cuisine', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-4 !text-black !placeholder-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-green-300"
                                    placeholder="Mô tả ẩm thực địa phương"
                                />
                            </div>
                            {/* Suitable Customers */}
                            <div className="group">
                                <label htmlFor="suitable_customers" className="block text-lg font-semibold text-gray-800 mb-3">
                                    Đối tượng phù hợp
                                </label>
                                <textarea
                                    id="suitable_customers"
                                    value={formData.suitable_customers}
                                    onChange={(e) => handleInputChange('suitable_customers', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-4 !text-black !placeholder-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-green-300"
                                    placeholder="Mô tả đối tượng phù hợp"
                                />
                            </div>
                            {/* Ideal Times */}
                            <div className="group">
                                <label htmlFor="ideal_times" className="block text-lg font-semibold text-gray-800 mb-3">
                                    Thời gian lý tưởng
                                </label>
                                <textarea
                                    id="ideal_times"
                                    value={formData.ideal_times}
                                    onChange={(e) => handleInputChange('ideal_times', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-4 !text-black !placeholder-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-green-300"
                                    placeholder="Mô tả thời gian lý tưởng"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-8 border-t-2 border-green-200/50">
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
                                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
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
                                    <span className="font-semibold">Tạo tour</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 