import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { PaymentInfo, VnpayPaymentRequest } from "../dtos/payment.dto";
import api from "../services/api_info";
import type { Tour } from "../dtos/tour.dto";
import type { UserInfo } from "../dtos/user.dto";
import { getUserInfoFromCookie } from "./LoginContext";
import { clearCookie } from "../services/cookies/Cookies";
import { AxiosError } from "axios";

interface VnpayContextProps {
    // Tắt mở popup
    showVnpay: boolean;
    setShowVnpay: (value: boolean) => void;

    // New Request
    request: PaymentInfo | null;
    setRequest: (value: PaymentInfo | null) => void;

    // Register thông tin hoá đơn
    orderInfo: VnpayPaymentRequest | null;
    setOrderInfo: (value: VnpayPaymentRequest | null) => void;

    // Create sandbox url
    onCreateUrl: boolean;
    setOnCreateUrl: (value: boolean) => void;
}
const VnpayContext = createContext<VnpayContextProps | undefined>(undefined);

export const useVnpay = () => {
    const context = useContext(VnpayContext);
    if (!context) throw new Error("useVnpay must be used within VnpayProvider");
    return context;
};

const removeVnpayCookie = (
    username: string,
    tourCode: string
) => {
    const cookieName = `vnpay_request_${username}_${tourCode}`;
    clearCookie(cookieName);
}

const saveVnpayRequestToCookie = (
    url: string,
    username: string,
    tourCode: string
): VnpayPaymentRequest | null => {
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

    if (
        vnp_Amount && vnp_Command && vnp_CreateDate && vnp_CurrCode &&
        vnp_IpAddr && vnp_Locale && vnp_OrderInfo && vnp_OrderType &&
        vnp_ReturnUrl && vnp_TmnCode && vnp_TxnRef && vnp_Version && vnp_SecureHash
    ) {
        const request: VnpayPaymentRequest = {
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

        const cookieName = `vnpay_request_${username}_${tourCode}`;
        const cookieValue = encodeURIComponent(JSON.stringify(request));
        document.cookie = `${cookieName}=${cookieValue}; path=/; max-age=86400`;
        return request;
    }

    return null;
};

const buildVnpayUrl = (
    baseUrl: string,
    data: VnpayPaymentRequest
): string => {
    const params = new URLSearchParams({
        vnp_Amount: data.vnp_Amount,
        vnp_Command: data.vnp_Command,
        vnp_CreateDate: data.vnp_CreateDate,
        vnp_CurrCode: data.vnp_CurrCode,
        vnp_IpAddr: data.vnp_IpAddr,
        vnp_Locale: data.vnp_Locale,
        vnp_OrderInfo: encodeURIComponent(data.vnp_OrderInfo),
        vnp_OrderType: data.vnp_OrderType,
        vnp_ReturnUrl: encodeURIComponent(data.vnp_ReturnUrl),
        vnp_TmnCode: data.vnp_TmnCode,
        vnp_TxnRef: data.vnp_TxnRef,
        vnp_Version: data.vnp_Version,
        vnp_SecureHash: data.vnp_SecureHash
    });

    return `${baseUrl}?${params.toString()}`;
};

export const getVnpayRequestFromCookie = (
    username: string,
    tourCode: string
): VnpayPaymentRequest | null => {
    const cookieName = `vnpay_request_${username}_${tourCode}`;
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${cookieName.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}=([^;]*)`)
    );

    if (match) {
        try {
            return JSON.parse(decodeURIComponent(match[1]));
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("Failed to parse VNPAY request from cookie: ", e.message);
            } else {
                console.error("Failed to parse VNPAY request from cookie:\n", e);
            }
        }
    }

    return null;
};

export const createPaymentRequest = (tour: Tour): PaymentInfo | null => {
    const userinfo = getUserInfoFromCookie();
    if (userinfo != null) {
        const generateRandomIP = (): string => {
            return Array(4)
                .fill(0)
                .map(() => Math.floor(Math.random() * 256))
                .join(".");
        }
        return {
            "orderType": "billpayment",
            "amount": tour.priceValue,
            "orderDescription": `Thanh toán phí đặt tour ${tour.tourCode}`,
            "name": `${userinfo.username}`,
            "tourCode": tour.tourCode,
            "ip": generateRandomIP()
        }
    } else {
        return null
    }
}

export const VnpayProvider = ({ children }: { children: ReactNode }) => {
    const [showVnpay, setShowVnpay] = useState(false);
    const [request, setRequest] = useState<PaymentInfo | null>(null);
    const [orderInfo, setOrderInfo] = useState<VnpayPaymentRequest | null>(null);
    const [onCreateUrl, setOnCreateUrl] = useState(false);

    const createPaymentUrl = async () => {
        setOnCreateUrl(true);
        try {
            if (request?.name && request.tourCode) {
                try {
                    const res = await api.post<string>('/pay/create-order', request);
                    console.log(res.data); // or handle the URL response
                    const info = saveVnpayRequestToCookie(res.data, request.name, request.tourCode);
                    if (info) {
                        setOrderInfo(info);
                    } else {
                        removeVnpayCookie(request.name, request.tourCode);
                    }
                } catch (error: unknown) {
                    throw new Error(`Tạo đơn hàng thất bại: ${error}`);
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log("Tạo đơn hàng thất bại: ", error);
            }
        }
        setOnCreateUrl(false);
        setRequest(null);
    };

    useEffect(() => {
        if (request) {
            setShowVnpay(true);
            const history = getVnpayRequestFromCookie(request.name, request.tourCode);
            if (history == null) {
                createPaymentUrl(); // Call the async function
            } else {
                setOrderInfo(history);
            }
        }
    }, [request]);

    useEffect(() => {
        if (orderInfo != null) {
            const baseUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
            const fullUrl = buildVnpayUrl(baseUrl, orderInfo);
            window.location.href = fullUrl;
        }
    }, [orderInfo]);


    return (
        <VnpayContext.Provider value={{ showVnpay, setShowVnpay, request, setRequest, orderInfo, setOrderInfo, onCreateUrl, setOnCreateUrl }}>
            {children}
        </VnpayContext.Provider>
    );
};


