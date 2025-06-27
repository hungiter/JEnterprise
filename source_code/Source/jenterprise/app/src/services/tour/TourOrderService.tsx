import axios, { AxiosError } from 'axios';
import type { OrderCreateRequest, OrderCreateResponse, OrderPaidRequest, OrderPaidResponse, TourOrder } from '@/src/dtos/tour.dto';
import api, { API_TOUR_BASE } from '../api_info';

// Lấy tất cả đơn hàng tour
export const fetchAllTourOrders = async (): Promise<TourOrder[]> => {
    try {
        const res = await axios.get<TourOrder[]>(`${API_TOUR_BASE}/order`, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        // console.log("Danh sách tất cả đơn hàng:", res.data);
        return res.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Lấy danh sách đơn hàng thất bại: ${error.message}`);
        } else {
            console.error(`Lấy danh sách đơn hàng thất bại:\n${error}`);
        }
        return [];
    }
};

// Tìm đơn hàng theo username hoặc instanceId
export const findTourOrders = async (
    username?: string,
    instanceId?: string
): Promise<TourOrder[]> => {
    try {
        const params = new URLSearchParams();
        if (username) params.append('username', username);
        if (instanceId) params.append('instanceId', instanceId);

        const queryString = params.toString();
        const url = `${API_TOUR_BASE}/order/find${queryString ? `?${queryString}` : ''}`;

        const res = await axios.get<TourOrder[]>(url, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        // console.log("Kết quả tìm kiếm đơn hàng:", res.data);
        return res.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Tìm kiếm đơn hàng thất bại: ${error.message}`);
        } else {
            console.error(`Tìm kiếm đơn hàng thất bại:\n${error}`);
        }
        return [];
    }
};

// Tạo đơn hàng mới
export const createTourOrder = async (request: OrderCreateRequest): Promise<OrderCreateResponse> => {
    try {
        const res = await axios.post<OrderCreateResponse>(`${API_TOUR_BASE}/order/create`, request, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        // console.log("Tạo đơn hàng thành công:", res.data);
        return res.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            return {
                success: false,
                message: "Có lỗi xảy ra khi tạo đơn hàng: " + error.response?.data?.message || error.message
            };
        } else {
            return {
                success: false,
                message: "Có lỗi xảy ra khi tạo đơn hàng: " + error
            };
        }
    };
}

// Chấp nhận đơn hàng
export const acceptOrder = async (request: OrderPaidRequest): Promise<OrderPaidResponse> => {
    try {
        const res = await axios.put<OrderCreateResponse>(`${API_TOUR_BASE}/order/accept`, request, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        // console.log("Gửi yêu cầu chấp nhận đơn hàng thành công:", res.data);
        return res.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Gửi yêu cầu chấp nhận đơn hàng thất bại: ${error.message}`);
            return {
                success: false,
                message: `Gửi yêu cầu chấp nhận đơn hàng thất bại: ${error.response?.data?.message || error.message}`
            };
        } else {
            console.error(`Gửi yêu cầu chấp nhận đơn hàng thất bại:\n${error}`);
            return {
                success: false,
                message: "Có lỗi xảy ra khi gửi yêu cầu chấp nhận đơn hàng"
            };
        }
    }
};

// Từ chối đơn hàng
export const rejectOrder = async (request: OrderPaidRequest): Promise<OrderPaidResponse> => {
    try {
        const res = await axios.put<OrderCreateResponse>(`${API_TOUR_BASE}/order/reject`, request, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        // console.log("Gửi yêu cầu từ chối đơn hàng thành công:", res.data);
        return res.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Gửi yêu cầu từ chối đơn hàng thất bại: ${error.message}`);
            return {
                success: false,
                message: `Gửi yêu cầu từ chối đơn hàng thất bại: ${error.response?.data?.message || error.message}`
            };
        } else {
            console.error(`Gửi yêu cầu từ chối đơn hàng thất bại:\n${error}`);
            return {
                success: false,
                message: "Có lỗi xảy ra khi gửi yêu cầu từ chối đơn hàng"
            };
        }
    }
};

// Lấy đơn hàng của người dùng cụ thể
export const fetchUserOrders = async (username: string): Promise<TourOrder[]> => {
    return findTourOrders(username);
};

// Lấy thông tin đơn hàng theo instanceId
export const fetchOrderByInstanceId = async (instanceId: string): Promise<TourOrder | null> => {
    const orders = await findTourOrders(undefined, instanceId);
    return orders.length > 0 ? orders[0] : null;
};

// Lấy thống kê đơn hàng (tính toán từ danh sách đơn hàng)
export const getOrderStats = async (): Promise<{
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
}> => {
    try {
        const orders = await fetchAllTourOrders();

        const stats = {
            totalOrders: orders.length,
            pendingOrders: orders.filter(order => order.status === "pending").length,
            confirmedOrders: orders.filter(order => order.status === "accept").length,
            cancelledOrders: orders.filter(order => order.status === "reject").length,
            totalRevenue: orders
                .filter(order => order.status === 'accept')
                .reduce((sum, order) => sum + (order.totalTicket * order.ticketPrice), 0)
        };

        // console.log("Thống kê đơn hàng:", stats);
        return stats;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Lấy thống kê đơn hàng thất bại: ${error.message}`);
        } else {
            console.error(`Lấy thống kê đơn hàng thất bại:\n${error}`);
        }
        return {
            totalOrders: 0,
            pendingOrders: 0,
            confirmedOrders: 0,
            cancelledOrders: 0,
            totalRevenue: 0
        };
    }
}; 