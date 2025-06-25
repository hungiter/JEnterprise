import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getOrderStats, fetchAllTourOrders, acceptOrder as acceptOrderApi, rejectOrder as rejectOrderApi } from '@/src/services/tour/TourOrderService';
import type { TourOrder } from '@/src/dtos/tour.dto';
import type { OrderPaidResponse } from '@/src/dtos/tour.dto';
import { useAdmin } from '@/src/context/AdminContext';

export type OrderStats = {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
};

const defaultStats: OrderStats = {
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
};

export interface OrderStatsContextType {
    stats: OrderStats;
    orders: TourOrder[];
    refresh: () => Promise<void>;
    loading: boolean;
    acceptOrder: (instanceId: string, id: string) => Promise<OrderPaidResponse>;
    rejectOrder: (instanceId: string, id: string) => Promise<OrderPaidResponse>;
    userInfo?: any;
}

const OrderStatsContext = createContext<OrderStatsContextType | undefined>(undefined);

export const useOrderStats = () => {
    const context = useContext(OrderStatsContext);
    if (!context) {
        throw new Error('useOrderStats must be used within an OrderStatsProvider');
    }
    return context;
};

export const OrderStatsProvider = ({ children }: { children: ReactNode }) => {
    const [stats, setStats] = useState<OrderStats>(defaultStats);
    const [orders, setOrders] = useState<TourOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const { userInfo } = useAdmin();

    const fetchStats = async (order: TourOrder | null = null) => {
        const oldOrders = orders;
        if (order == null) {
            setLoading(true);
            const fetchedOrders = await fetchAllTourOrders();
            oldOrders.push(...fetchedOrders);
            setOrders(oldOrders);
        }

        if (order != null) {
            const index = oldOrders.findIndex(o => o.instanceId === order.instanceId);
            if (index !== -1) {
                oldOrders[index] = order;
            }
            setOrders(oldOrders);
        }

        const stats = {
            totalOrders: oldOrders.length,
            pendingOrders: oldOrders.filter(order => order.status.trim().toLowerCase() === 'pending').length,
            confirmedOrders: oldOrders.filter(order => order.status.trim().toLowerCase() === 'accept').length,
            cancelledOrders: oldOrders.filter(order => order.status.trim().toLowerCase() === 'reject').length,
            totalRevenue: oldOrders
                .filter(order => order.status.trim().toLowerCase() === 'accept')
                .reduce((sum, order) => sum + (order.totalTicket * order.ticketPrice), 0)
        };

        setStats(stats);
        if (loading) { setLoading(false); }
    };

    const acceptOrder = async (instanceId: string, username: string): Promise<OrderPaidResponse> => {
        if (!userInfo || userInfo.role !== 'admin') {
            alert('Bạn cần đăng nhập với quyền admin để thực hiện thao tác này.');
            return { success: false, message: 'Bạn cần đăng nhập với quyền admin để thực hiện thao tác này.' };
        }
        const result = await acceptOrderApi({ "instanceId": instanceId, "username": username });
        if (result.success && result.tourOrder != null) {
            await fetchStats(result.tourOrder);
            alert('Chấp nhận đơn hàng thành công!');
        } else {
            alert(`Lỗi: ${result.message}`);
        }
        return result;
    };

    const rejectOrder = async (instanceId: string, username: string): Promise<OrderPaidResponse> => {
        if (!userInfo || userInfo.role !== 'admin') {
            alert('Bạn cần đăng nhập với quyền admin để thực hiện thao tác này.');
            return { success: false, message: 'Bạn cần đăng nhập với quyền admin để thực hiện thao tác này.' };
        }
        const result = await rejectOrderApi({ "instanceId": instanceId, "username": username });
        if (result.success && result.tourOrder != null) {
            await fetchStats(result.tourOrder);
            alert('Từ chối đơn hàng thành công!');
        } else {
            alert(`Lỗi: ${result.message}`);
        }
        return result;
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <OrderStatsContext.Provider value={{ stats, orders, refresh: fetchStats, loading, acceptOrder, rejectOrder, userInfo }}>
            {children}
        </OrderStatsContext.Provider>
    );
}; 