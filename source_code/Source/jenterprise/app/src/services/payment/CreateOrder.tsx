import axios from 'axios'
import type { UserInfo } from '@/src/dtos/user.dto';
import { API_VN_PAY } from '../api_info'
import type { Tour } from '@/src/dtos/tour.dto';
import type { CreatePaymentUrlResponse } from '@/src/dtos/payment.dto';

const getClientIp = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip; // e.g., "123.123.123.123"
    } catch (error) {
        console.error("Failed to get client IP", error);
        return '';
    }
};

export const createPaymentOrder = async (tour: Tour, user: UserInfo): Promise<CreatePaymentUrlResponse> => {
    const ip = await getClientIp()
    if (!ip) return { "success": false, "message": "Không tìm thấy địa chỉ IP người dùng.", "url": "" }

    const paymentInfo = {
        "orderType": "billpayment",
        "amount": tour.priceValue,
        "orderDescription": `Thanh toán phí đặt tour ${tour.tourCode}`,
        "name": `${user.username}`,
        "tourCode": tour.tourCode,
        "ip": ip
    }

    const res = await axios.post<string>(`${API_VN_PAY}/create-url`,
        paymentInfo, // đây là phần body
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return { "success": true, "message": "Thành công.", "url": res.data }
}