import { useAdmin } from "../../context/AdminContext";
import { FaPlane, FaPlus, FaEdit, FaTrash, FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaArrowLeft, FaRocket, FaGem, FaFilter, FaGlobe } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdReturnLeft } from "react-icons/io";

// Mock data for demonstration
const mockTours = [
    {
        id: 1,
        name: "Du lịch Đà Nẵng - Hội An",
        code: "DN-HA-001",
        price: "2,500,000",
        duration: "3 ngày 2 đêm",
        destination: "Đà Nẵng, Hội An",
        status: "active",
        bookings: 45
    },
    {
        id: 2,
        name: "Khám phá Sapa mùa lúa chín",
        code: "SP-001",
        price: "3,200,000",
        duration: "4 ngày 3 đêm",
        destination: "Sapa, Lào Cai",
        status: "active",
        bookings: 32
    },
    {
        id: 3,
        name: "Tour Phú Quốc biển xanh",
        code: "PQ-001",
        price: "4,500,000",
        duration: "5 ngày 4 đêm",
        destination: "Phú Quốc, Kiên Giang",
        status: "inactive",
        bookings: 18
    },
    {
        id: 4,
        name: "Hà Nội - Ninh Bình cổ kính",
        code: "HN-NB-001",
        price: "1,800,000",
        duration: "2 ngày 1 đêm",
        destination: "Hà Nội, Ninh Bình",
        status: "active",
        bookings: 67
    },
    {
        id: 5,
        name: "Mekong Delta Discovery",
        code: "MD-001",
        price: "2,800,000",
        duration: "3 ngày 2 đêm",
        destination: "Cần Thơ, An Giang",
        status: "active",
        bookings: 23
    },
];

export default function TourManagementPage() {
    const { userInfo, isAdmin } = useAdmin();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    if (!isAdmin) {
        return null;
    }

    const filteredTours = mockTours.filter(tour => {
        const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tour.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tour.destination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || tour.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadgeColor = (status: string) => {
        return status === "active"
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
            : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg";
    };

    const handleEditTour = (tourCode: string) => {
        navigate(`/admin/tours/${tourCode}/edit`);
    };

    return (
        <div className="space-y-8">
            {/* Header với thiết kế độc đáo */}
            <div className="bg-gradient-to-r from-white via-green-50 to-blue-50 rounded-2xl shadow-xl border border-green-200/50 p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => navigate('/admin')}
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
                                    <FaPlane className="w-6 h-6 text-white" />
                                </div>
                                Quản lý tour
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/admin/tours/add', { state: { from: '/admin/tours' } })}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                    >
                        <div className="hidden md:flex items-center space-x-3">
                            <FaPlus className="w-5 h-5" />
                            <span className="font-semibold">Thêm tour mới</span>
                        </div>
                        <div className="flex md:hidden">
                            <FaPlus className="w-6 h-6" />
                        </div>
                    </button>
                </div>
            </div>

            {/* Filters với thiết kế mới */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-200/50 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative group">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã tour hoặc điểm đến..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 !text-black !placeholder-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        />
                    </div>
                    <div className="relative group">
                        <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 !text-black !placeholder-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none cursor-pointer"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                        <div className="bg-gradient-to-r from-green-100 to-blue-100 px-6 py-4 rounded-xl border border-green-200/50">
                            <div className="text-lg font-bold text-gray-800">Tổng: {filteredTours.length}</div>
                            <div className="text-sm text-gray-600">tour</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tours Table - Mobile Cards với thiết kế mới */}
            <div className="md:hidden space-y-6">
                {filteredTours.map((tour) => (
                    <div key={tour.id} className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg border border-green-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                    <FaPlane className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <div className="font-bold text-lg text-gray-900">{tour.name}</div>
                                    <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg">{tour.code}</div>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => navigate(`/admin/tours/${tour.code}/edit`, { state: { from: '/admin/tours' } })}
                                    className="text-blue-600 hover:text-blue-800 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-110"
                                >
                                    <FaEdit className="w-5 h-5" />
                                </button>
                                <button className="text-red-600 hover:text-red-800 cursor-pointer p-2 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-110">
                                    <FaTrash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div className="bg-white/50 p-3 rounded-xl border border-green-200/50">
                                <div className="text-gray-500 font-medium mb-1">Giá tour</div>
                                <div className="font-bold text-lg text-gray-900">{tour.price} VNĐ</div>
                            </div>
                            <div className="bg-white/50 p-3 rounded-xl border border-green-200/50">
                                <div className="text-gray-500 font-medium mb-1">Thời gian</div>
                                <div className="font-semibold text-gray-900 flex items-center">
                                    <FaCalendarAlt className="w-4 h-4 mr-1 text-green-600" />
                                    {tour.duration}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div className="bg-white/50 p-3 rounded-xl border border-green-200/50">
                                <div className="text-gray-500 font-medium mb-1">Điểm đến</div>
                                <div className="font-semibold text-gray-900 flex items-center">
                                    <FaMapMarkerAlt className="w-4 h-4 mr-1 text-blue-600" />
                                    {tour.destination}
                                </div>
                            </div>
                            <div className="bg-white/50 p-3 rounded-xl border border-green-200/50">
                                <div className="text-gray-500 font-medium mb-1">Đặt tour</div>
                                <div className="font-bold text-lg text-gray-900">{tour.bookings}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeColor(tour.status)}`}>
                                {tour.status === "active" ? "Hoạt động" : "Không hoạt động"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tours Table - Desktop với thiết kế mới */}
            <div className="hidden md:block bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200/50">
                        <thead className="bg-gradient-to-r from-green-50 to-blue-50">
                            <tr>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Tour
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Mã tour
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Giá
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Thời gian
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Đặt tour
                                </th>
                                <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                            {filteredTours.map((tour) => (
                                <tr key={tour.id} className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-blue-50/50 transition-all duration-300">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                                                <FaPlane className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {tour.name}
                                                </div>
                                                <div className="text-sm text-gray-600 flex items-center">
                                                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-blue-600" />
                                                    {tour.destination}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                                            {tour.code}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-lg font-bold text-gray-900">
                                            {tour.price} VNĐ
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FaCalendarAlt className="w-4 h-4 mr-2 text-green-600" />
                                            {tour.duration}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeColor(tour.status)}`}>
                                            {tour.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-lg font-bold text-gray-900">
                                            {tour.bookings}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => navigate(`/admin/tours/${tour.code}/edit`, { state: { from: '/admin/tours' } })}
                                                className="text-blue-600 hover:text-blue-800 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-110"
                                            >
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