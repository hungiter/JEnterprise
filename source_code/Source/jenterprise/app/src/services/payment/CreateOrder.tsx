import axios, { AxiosError } from 'axios'
import type { UserInfo } from '@/src/dtos/user.dto';
import api, { API_VN_PAY } from '../api_info'
import type { Tour } from '@/src/dtos/tour.dto';
import type { CreatePaymentUrlResponse } from '@/src/dtos/payment.dto';

function generateRandomIP(): string {
    return Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * 256))
        .join(".");
}

export const createPaymentOrder = async (
    tour: Tour,
    user: UserInfo,
    instanceId: string,
    ticketQuantity: number = 1,
    totalAmount?: number
): Promise<CreatePaymentUrlResponse> => {
    // const ip = await getClientIp()
    const ip = generateRandomIP()

    if (!ip) return { "success": false, "message": "Không tìm thấy địa chỉ IP người dùng.", "url": "" }

    // Tính tổng tiền nếu không được truyền vào
    const finalTotalAmount = totalAmount || (tour.priceValue * ticketQuantity);

    const finalTourCode = instanceId;

    const paymentInfo = {
        "orderType": "billpayment",
        "amount": finalTotalAmount,
        "orderDescription": `Thanh toán phí đặt tour ${finalTourCode} - ${ticketQuantity} vé`,
        "name": `${user.username}`,
        "tourCode": finalTourCode,
        "ip": ip
    }
    try {
        const res = await api.post<string>(`/pay/create-order`,
            paymentInfo
        );

        return { "success": true, "message": "Thành công.", "url": res.data }
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(error.response?.data?.error)
            return { "success": false, "message": `${error.response?.status}` }
        } else {
            console.error(error)
            return { "success": false, "message": `${error}` }
        }
    }
}