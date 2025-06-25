import React, { useState, useEffect } from 'react';
import type { TourOrder } from '@/src/dtos/tour.dto';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderDialogProps {
    order: TourOrder | null;
    open: boolean;
    action: 'accept' | 'reject';
    onClose: () => void;
    onConfirm: () => Promise<boolean | string | void>;
    loading?: boolean;
}

const actionText = {
    accept: 'duyệt',
    reject: 'từ chối',
};

const actionColor = {
    accept: 'bg-green-600 hover:bg-green-700',
    reject: 'bg-red-600 hover:bg-red-700',
};

const OrderDialog: React.FC<OrderDialogProps> = ({ order, open, action, onClose, onConfirm, loading }) => {
    const [error, setError] = useState<string | null>(null);
    const [internalLoading, setInternalLoading] = useState(false);

    useEffect(() => {
        if (!open) setError(null);
    }, [open]);

    const handleConfirm = async () => {
        setInternalLoading(true);
        setError(null);
        const result = await onConfirm();
        if (result === true || result === undefined) {
            setInternalLoading(false);
            onClose(); // Đóng dialog khi thành công
        } else if (typeof result === 'string') {
            setError(result);
            setInternalLoading(false);
        } else {
            setError('Có lỗi xảy ra, vui lòng thử lại.');
            setInternalLoading(false);
        }
    };

    if (!open || !order) return null;
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs ${internalLoading ? 'pointer-events-none' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={internalLoading ? undefined : onClose}
                >
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden text-black"
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        transition={{ duration: 0.3 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="hidden md:block absolute top-3 right-6 text-gray-400 hover:text-red-500 text-xl lg:text-2xl cursor-pointer"
                            onClick={onClose}
                            aria-label="Đóng"
                            disabled={internalLoading}
                            style={internalLoading ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                        >
                            ×
                        </button>
                        <h2 className="text-lg font-bold mb-4 text-center text-black">Xác nhận {actionText[action]} đơn hàng</h2>
                        <div className="mb-4 text-center">
                            Bạn có chắc chắn muốn <span className="font-semibold">{actionText[action]}</span> đơn hàng <span className="font-mono">{order.id}</span> của <span className="font-semibold">{order.username}</span> không?
                        </div>
                        <div className="mb-4 text-sm text-left space-y-1 bg-gray-50 rounded p-3">
                            <div><span className="font-semibold">Mã đơn hàng:</span> <span className="font-mono">{order.id}</span></div>
                            <div><span className="font-semibold">Người đặt:</span> {order.username}</div>
                            <div><span className="font-semibold">Số vé:</span> {order.totalTicket}</div>
                            <div><span className="font-semibold">Giá vé:</span> {order.ticketPrice.toLocaleString('vi-VN')} VNĐ</div>
                            <div><span className="font-semibold">Tổng tiền:</span> {(order.totalTicket * order.ticketPrice).toLocaleString('vi-VN')} VNĐ</div>
                            <div><span className="font-semibold">Ngày tạo:</span> {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                            {order.updatedAt && order.updatedAt !== order.createdAt && (
                                <div><span className="font-semibold">Ngày cập nhật:</span> {new Date(order.updatedAt).toLocaleString('vi-VN')}</div>
                            )}
                        </div>
                        {error && <div className="text-red-600 text-center mb-3 font-semibold">{error}</div>}
                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                className="px-4 py-2 rounded-xl bg-gray-300 text-black font-semibold hover:bg-gray-400"
                                onClick={onClose}
                                disabled={internalLoading}
                                style={internalLoading ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                            >
                                Đóng
                            </button>
                            {internalLoading ? (
                                <div className="flex items-center px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold animate-pulse">
                                    <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
                                    </svg>
                                    Đang xử lý...
                                </div>
                            ) : (
                                <button
                                    className={`px-4 py-2 rounded-xl text-white font-semibold disabled:opacity-60 ${actionColor[action]}`}
                                    onClick={handleConfirm}
                                    disabled={internalLoading}
                                >
                                    Xác nhận
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OrderDialog; 