export interface CardInfo {
    id: number
    cardType: string
    issuer: string
    cardNumber: string
    cardHolder: string
    issueDate: string
    expiryDate: string
    city: string
    email: string
    address: string
    cvv: string
    otp: string
}

export interface PaymentInfo {
    orderType: string;
    amount: number;
    orderDescription: string;
    name: string;
    tourCode: string;
    ip: string;
}

export interface VnpayPaymentRequest {
    vnp_Amount: string; // Ex: "699000000"
    vnp_Command: string; // Ex: "pay"
    vnp_CreateDate: string; // Ex: "20250613162350"
    vnp_CurrCode: string; // Ex: "VND"
    vnp_IpAddr: string; // Ex: "156.238.103.255"
    vnp_Locale: string; // Ex: "vn"
    vnp_OrderInfo: string; // Ex: "thanhhaimap Thanh toán phí đặt tour NDDLO243 6990000.0"
    vnp_OrderType: string; // Ex: "billpayment"
    vnp_ReturnUrl: string; // Ex: "https://ultimately-flowing-stag.ngrok-free.app/pay/execute"
    vnp_TmnCode: string; // Ex: "JVFCAPRB" // Need hide
    vnp_TxnRef: string; // Ex: "1749806630000"
    vnp_Version: string; // Ex: "2.1.0"
    vnp_SecureHash: string; // Ex: "49937cdaaade..."
}

export interface CreatePaymentUrlResponse {
    success: boolean
    url?: string;
    message: string
}

export interface VnPayTransaction {
    username: string
    tourCode: string
    orderDescription: string
    paymentUrl: string
    createAt: string
    expireAt: string
    status: string
}




export const parseVnpayUrl = (url: string): VnpayPaymentRequest | null => {
    const params = new URLSearchParams(new URL(url).search);

    const vnp_Amount = params.get("vnp_Amount");
    const vnp_Command = params.get("vnp_Command");
    const vnp_CreateDate = params.get("vnp_CreateDate");
    const vnp_CurrCode = params.get("vnp_CurrCode");
    const vnp_IpAddr = params.get("vnp_IpAddr");
    const vnp_Locale = params.get("vnp_Locale");
    const vnp_OrderInfo = params.get("vnp_OrderInfo");
    const vnp_OrderType = params.get("vnp_OrderType");
    const vnp_ReturnUrl = params.get("vnp_ReturnUrl");
    const vnp_TmnCode = params.get("vnp_TmnCode");
    const vnp_TxnRef = params.get("vnp_TxnRef");
    const vnp_Version = params.get("vnp_Version");
    const vnp_SecureHash = params.get("vnp_SecureHash");

    // Kiểm tra bắt buộc các trường cần thiết (bạn có thể tùy chỉnh danh sách này)
    if (
        vnp_Amount && vnp_Command && vnp_CreateDate && vnp_CurrCode &&
        vnp_IpAddr && vnp_Locale && vnp_OrderInfo && vnp_OrderType &&
        vnp_ReturnUrl && vnp_TmnCode && vnp_TxnRef && vnp_Version && vnp_SecureHash
    ) {
        return {
            vnp_Amount,
            vnp_Command,
            vnp_CreateDate,
            vnp_CurrCode,
            vnp_IpAddr,
            vnp_Locale,
            vnp_OrderInfo: decodeURIComponent(vnp_OrderInfo),
            vnp_OrderType,
            vnp_ReturnUrl: decodeURIComponent(vnp_ReturnUrl),
            vnp_TmnCode,
            vnp_TxnRef,
            vnp_Version,
            vnp_SecureHash
        };
    }

    // Nếu thiếu bất kỳ trường nào thì trả về null (hoặc throw lỗi tùy mục đích)
    return null;
};