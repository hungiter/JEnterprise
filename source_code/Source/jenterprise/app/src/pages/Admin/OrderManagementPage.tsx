import { useAdmin } from "../../context/AdminContext";
import { FaClipboardList, FaCheck, FaTimes, FaSearch, FaFilter, FaEye, FaCalendarAlt, FaUser, FaTicketAlt, FaMoneyBillWave, FaArrowLeft, FaClock, FaSyncAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdReturnLeft } from "react-icons/io";
import type { TourOrder } from "@/src/dtos/tour.dto";
import { useOrderStats } from "@/src/context/OrderStatsContext";
import OrderDialog from '@/src/components/ui/OrderDialog';

// Thêm type mở rộng cho hiệu ứng highlight
type TourOrderWithUpdate = TourOrder & { _justUpdated?: boolean };

export default function OrderManagementPage() {
    const { userInfo, isAdmin } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const { orders, loading, refresh, acceptOrder, rejectOrder } = useOrderStats();
    const [filteredOrders, setFilteredOrders] = useState<TourOrderWithUpdate[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedOrder, setSelectedOrder] = useState<TourOrder | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ORDERS_PER_PAGE = 100;
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);
    const [dialogAction, setDialogAction] = useState<'accept' | 'reject' | null>(null);

    // Lọc đơn hàng khi search hoặc filter thay đổi
    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter]);

    // Reset to page 1 when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, orders]);

    // Lọc đơn hàng theo tìm kiếm và trạng thái
    const filterOrders = () => {
        let filtered = orders;

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.instanceId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    };

    // Xử lý chấp nhận đơn hàng
    const handleAcceptOrder = async (instanceId: string, username: string) => {
        const result = await acceptOrder(instanceId, username);
        if (result?.success) {
            refresh(); // chỉ reload lại danh sách đơn hàng
        }
    };

    // Xử lý từ chối đơn hàng
    const handleRejectOrder = async (instanceId: string, username: string) => {
        const result = await rejectOrder(instanceId, username);
        if (result?.success) {
            refresh(); // chỉ reload lại danh sách đơn hàng
        }
    };

    // Lấy màu badge theo trạng thái
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "accept":
                return "bg-green-100 text-green-800 border-green-200";
            case "reject":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Lấy text trạng thái tiếng Việt
    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Chờ xử lý";
            case "accept":
                return "Đã chấp nhận";
            case "reject":
                return "Đã từ chối";
            default:
                return status;
        }
    };

    // Format timestamp thành ngày giờ
    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('vi-VN');
    };

    // Tính tổng doanh thu
    const totalRevenue = orders
        .filter(order => order.status === "accept")
        .reduce((sum, order) => sum + (order.totalTicket * order.ticketPrice), 0);

    // 1. Filter orders based on search and status (already handled by filterOrders)
    // 2. Calculate total pages for the current filter
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

    // 3. Clamp currentPage to valid range when filteredOrders or totalPages changes
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages === 0 ? 1 : totalPages);
        } else if (currentPage < 1) {
            setCurrentPage(1);
        }
    }, [filteredOrders, totalPages]);

    // 4. Paginate filtered orders
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE
    );

    // 5. When filter/search changes, reset to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    if (!isAdmin) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách đơn hàng...</p>
                </div>
            </div>
        );
    }

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-white via-orange-50 to-red-50 rounded-2xl shadow-xl border border-orange-200/50 p-8 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
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
                                    <IoMdReturnLeft className="w-4 sm:w-6 h-4 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                            </button>
                            <div className="flex items-center space-x-3">
                                <FaClipboardList className="w-8 h-8 text-orange-600" />
                                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    Quản Lý Đơn Hàng
                                </h1>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-lg font-bold text-green-600">
                                Tổng doanh thu: {totalRevenue.toLocaleString('vi-VN')} VNĐ
                            </p>
                        </div>
                    </div>

                    {/* Thống kê nhanh */}
                    {/* Mobile: compact stats + more button */}
                    <div className="md:hidden flex-col items-center gap-3 mb-4">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-blue-700 font-semibold"><FaClipboardList className="w-5 h-5" /> Tổng đơn</span>
                            <span className="font-bold text-blue-800">{orders.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-yellow-700 font-semibold"><FaClock className="w-5 h-5" /> Chờ xử lý</span>
                            <span className="font-bold text-yellow-800">{orders.filter(o => o.status === "pending").length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-green-700 font-semibold"><FaCheck className="w-5 h-5" /> Đã duyệt</span>
                            <span className="font-bold text-green-800">{orders.filter(o => o.status === "accept").length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-red-700 font-semibold"><FaTimes className="w-5 h-5" /> Đã từ chối</span>
                            <span className="font-bold text-red-800">{orders.filter(o => o.status === "reject").length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-green-700 font-semibold"><FaMoneyBillWave className="w-5 h-5" /> Doanh thu</span>
                            <span className="font-bold text-green-800">{totalRevenue.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                    </div>
                    {/* Thống kê chi tiết cho md+ */}
                    <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Tổng đơn hàng</p>
                                    <p className="text-2xl font-bold text-blue-800">{orders.length}</p>
                                </div>
                                <FaClipboardList className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-yellow-600 font-medium">Chờ xử lý</p>
                                    <p className="text-2xl font-bold text-yellow-800">
                                        {orders.filter(o => o.status === "pending").length}
                                    </p>
                                </div>
                                <FaClock className="w-8 h-8 text-yellow-600" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Đã chấp nhận</p>
                                    <p className="text-2xl font-bold text-green-800">
                                        {orders.filter(o => o.status === "accept").length}
                                    </p>
                                </div>
                                <FaCheck className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 font-medium">Đã từ chối</p>
                                    <p className="text-2xl font-bold text-red-800">
                                        {orders.filter(o => o.status === "reject").length}
                                    </p>
                                </div>
                                <FaTimes className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Bộ lọc và tìm kiếm - gọn, rõ ràng, hợp lý */}
                    <div className="w-full mb-0 md:mb-4 flex flex-col md:flex-row items-stretch gap-3">
                        {/* Search input */}
                        <div className="flex-1 flex items-center relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm mã đơn, username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white"
                            />
                        </div>
                        {/* Filter select */}
                        <div className="flex items-center">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full md:w-44 px-4 py-2 text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white appearance-none cursor-pointer"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="accept">Đã chấp nhận</option>
                                <option value="reject">Đã từ chối</option>
                            </select>
                        </div>
                        {/* Refresh button */}
                        <button
                            onClick={refresh}
                            className="flex items-center justify-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-semibold shadow-sm transition border border-orange-200"
                            title="Làm mới danh sách"
                        >
                            <FaSyncAlt className="w-4 h-4 mr-2" />
                            <span className="hidden md:inline">Làm mới</span>
                        </button>
                    </div>


                    {/* Pagination controls (bottom) */}
                    <div className="hidden md:block">
                        <table className="min-w-full divide-y divide-orange-100">
                            <thead className="bg-orange-50 rounded-t-xl">
                                <tr>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase">STT</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-800 uppercase">Mã đơn hàng</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase">Trạng thái</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase">Ngày tạo</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase">Ngày cập nhật</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-50">
                                {paginatedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500 italic">Không có đơn hàng nào</td>
                                    </tr>
                                ) : (
                                    paginatedOrders.map((order, idx) => (
                                        <tr key={order.instanceId} className={`hover:bg-orange-100/60 transition ${order._justUpdated ? 'bg-green-100 animate-pulse' : ''}`}>
                                            <td className="px-4 py-2 text-center text-black font-medium">{(currentPage - 1) * ORDERS_PER_PAGE + idx + 1}</td>
                                            <td className="px-4 py-2 max-w-xs truncate font-mono text-black">{order.id}</td>
                                            <td className="px-4 py-2 text-center">
                                                {order.status === "pending" && <FaClock className="w-5 h-5 text-yellow-500 mx-auto" title="Chờ xử lý" />}
                                                {order.status === "accept" && <FaCheck className="w-5 h-5 text-green-600 mx-auto" title="Đã chấp nhận" />}
                                                {order.status === "reject" && <FaTimes className="w-5 h-5 text-red-500 mx-auto" title="Đã từ chối" />}
                                            </td>
                                            <td className="px-4 py-2 text-center text-xs text-gray-500">{formatTimestamp(order.createdAt)}</td>
                                            <td className="px-4 py-2 text-center text-xs text-gray-500">{order.updatedAt && order.updatedAt !== order.createdAt ? formatTimestamp(order.updatedAt) : ''}</td>
                                            <td className="px-4 py-2 text-center">
                                                {order.status === "pending" && (
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => { setSelectedOrder(order); setDialogAction('accept'); }}
                                                            className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 shadow-sm transition"
                                                            title="Duyệt"
                                                        >
                                                            <FaCheck className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedOrder(order); setDialogAction('reject'); }}
                                                            className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 shadow-sm transition"
                                                            title="Từ chối"
                                                        >
                                                            <FaTimes className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {filteredOrders.length > 0 && (
                            <div className="flex items-center justify-center gap-4 py-3 px-2 border-t border-orange-100">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded bg-orange-100 text-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    &larr; Trước
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded bg-orange-100 text-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Tiếp &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile view - card/list format */}
                <div className="md:hidden mt-4 space-y-4">
                    {paginatedOrders.length === 0 ? (
                        <div className="text-center text-gray-500 italic py-8">Không có đơn hàng nào phù hợp</div>
                    ) : (
                        paginatedOrders.map((order, idx) => (
                            <div key={order.instanceId} className="relative bg-white rounded-xl shadow border border-orange-200/50 p-4 flex flex-col gap-2">
                                {/* STT badge */}
                                <span className="absolute top-2 left-2 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full shadow">
                                    #{(currentPage - 1) * ORDERS_PER_PAGE + idx + 1}
                                </span>
                                {/* Mã đơn hàng */}
                                <div className="pl-14 pr-2 pt-2 pb-1">
                                    <span className="block font-mono text-base text-black font-semibold truncate">{order.id}</span>
                                </div>
                                {/* Trạng thái */}
                                <div className="flex items-center gap-2 pl-14 pb-1">
                                    {order.status === "pending" && (
                                        <>
                                            <FaClock className="w-5 h-5 text-yellow-500" title="Chờ xử lý" />
                                            <span className="text-xs text-yellow-700 font-semibold">Chờ xử lý</span>
                                        </>
                                    )}
                                    {order.status === "accept" && (
                                        <>
                                            <FaCheck className="w-5 h-5 text-green-600" title="Đã chấp nhận" />
                                            <span className="text-xs text-green-700 font-semibold">Đã duyệt</span>
                                        </>
                                    )}
                                    {order.status === "reject" && (
                                        <>
                                            <FaTimes className="w-5 h-5 text-red-500" title="Đã từ chối" />
                                            <span className="text-xs text-red-700 font-semibold">Từ chối</span>
                                        </>
                                    )}
                                </div>
                                {/* Ngày tạo, cập nhật */}
                                <div className="flex flex-col gap-1 pl-14">
                                    <span className="text-xs text-gray-500 flex items-center">
                                        <FaCalendarAlt className="w-3 h-3 mr-1" /> {formatTimestamp(order.createdAt)}
                                    </span>
                                    {order.updatedAt && order.updatedAt !== order.createdAt && (
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <FaCalendarAlt className="w-3 h-3 mr-1" /> Cập nhật: {formatTimestamp(order.updatedAt)}
                                        </span>
                                    )}
                                </div>
                                {/* Nút hành động */}
                                {order.status === "pending" && (
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => { setSelectedOrder(order); setDialogAction('accept'); }}
                                            className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center shadow-sm transition"
                                        >
                                            <FaCheck className="w-4 h-4 mr-2" /> Duyệt
                                        </button>
                                        <button
                                            onClick={() => { setSelectedOrder(order); setDialogAction('reject'); }}
                                            className="flex-1 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center shadow-sm transition"
                                        >
                                            <FaTimes className="w-4 h-4 mr-2" /> Từ chối
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {/* Pagination controls (bottom, mobile) */}
                    {filteredOrders.length > 0 && (
                        <div className="flex items-center justify-center gap-4 py-3 px-2 border-t border-orange-100">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-orange-100 text-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                &larr; Trước
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded bg-orange-100 text-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Tiếp &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Dialog xác nhận duyệt/từ chối đơn hàng */}
            <OrderDialog
                order={selectedOrder}
                open={!!selectedOrder && !!dialogAction}
                action={dialogAction as 'accept' | 'reject'}
                onClose={() => { setSelectedOrder(null); setDialogAction(null); }}
                loading={dialogLoading}
                onConfirm={async () => {
                    if (!selectedOrder || !dialogAction) return;
                    setDialogLoading(true);
                    let result;
                    if (dialogAction === 'accept') {
                        result = await acceptOrder(selectedOrder.instanceId, selectedOrder.username);
                    } else {
                        result = await rejectOrder(selectedOrder.instanceId, selectedOrder.username);
                    }
                    if (result?.success && result.tourOrder) {
                        // Cập nhật đúng 1 đơn hàng trong state bằng dữ liệu mới nhất từ response
                        setFilteredOrders(prev =>
                            prev.map(o =>
                                o.instanceId === selectedOrder.instanceId
                                    ? { ...o, ...result.tourOrder, _justUpdated: true }
                                    : o
                            )
                        );
                        setSelectedOrder(prev =>
                            prev ? { ...prev, ...result.tourOrder } : prev
                        );
                        setTimeout(() => {
                            setFilteredOrders(prev =>
                                prev.map(o =>
                                    o.instanceId === selectedOrder.instanceId
                                        ? { ...o, _justUpdated: false }
                                        : o
                                )
                            );
                        }, 1000);
                    }
                    setDialogLoading(false);
                    // Không đóng dialog ngay, để user thấy trạng thái mới
                }}
            />
        </div>
    );
} 