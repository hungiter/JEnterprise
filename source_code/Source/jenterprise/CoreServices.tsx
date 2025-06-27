/**
 * CORE SERVICES - TẬP TRUNG TẤT CẢ LOGIC CỐT LÕI
 * 
 * File này chứa tất cả các hàm cốt lõi của hệ thống:
 * - Payment: Xử lý thanh toán VNPAY
 * - Tour: Quản lý dữ liệu tour
 * - User: Quản lý thông tin người dùng
 * - Tag: Quản lý tags và tìm kiếm
 * 
 * Đây là file reference/documentation, không sử dụng trong code thực tế
 */

// ============================================================================
// PAYMENT CORE SERVICES
// ============================================================================

import type { VnpayPaymentRequest, PaymentInfo } from "./app/src/dtos/payment.dto";
import type { Tour } from "./app/src/dtos/tour.dto";
import type { UserInfo } from "./app/src/dtos/user.dto";
import { clearCookie } from "./app/src/services/cookies/Cookies";
import api from "./app/src/services/api_info";
import { AxiosError } from "axios";

/**
 * Xóa cookie payment request
 * @param username - Tên người dùng
 * @param tourCode - Mã tour
 */
export const removePaymentCookie = (username: string, tourCode: string) => {
    const cookieName = `payment_request_${username}_${tourCode}`;
    clearCookie(cookieName);
};

/**
 * Lưu thông tin payment request vào cookie
 * Hàm này parse URL từ server và lưu các tham số vào cookie
 * 
 * @param url - URL thanh toán từ server
 * @param username - Tên người dùng
 * @param tourCode - Mã tour
 * @returns VnpayPaymentRequest object hoặc null nếu lỗi
 */
export const savePaymentRequestToCookie = (
    url: string,
    username: string,
    tourCode: string
): VnpayPaymentRequest | null => {
    // Parse URL parameters từ URL thanh toán
    const params = new URLSearchParams(new URL(url).search);

    // Lấy tất cả các tham số cần thiết từ URL
    const vnp_Amount = params.get("vnp_Amount");           // Số tiền (x100)
    const vnp_Command = params.get("vnp_Command");         // Lệnh thanh toán
    const vnp_CreateDate = params.get("vnp_CreateDate");   // Ngày tạo
    const vnp_CurrCode = params.get("vnp_CurrCode");       // Mã tiền tệ
    const vnp_IpAddr = params.get("vnp_IpAddr");           // IP khách hàng
    const vnp_Locale = params.get("vnp_Locale");           // Ngôn ngữ
    const vnp_OrderInfo = params.get("vnp_OrderInfo");     // Thông tin đơn hàng
    const vnp_OrderType = params.get("vnp_OrderType");     // Loại đơn hàng
    const vnp_ReturnUrl = params.get("vnp_ReturnUrl");     // URL callback
    const vnp_TmnCode = params.get("vnp_TmnCode");         // Mã merchant
    const vnp_TxnRef = params.get("vnp_TxnRef");           // Mã giao dịch
    const vnp_Version = params.get("vnp_Version");         // Phiên bản API
    const vnp_SecureHash = params.get("vnp_SecureHash");   // Chữ ký bảo mật

    // Kiểm tra đầy đủ các tham số bắt buộc
    if (
        vnp_Amount && vnp_Command && vnp_CreateDate && vnp_CurrCode &&
        vnp_IpAddr && vnp_Locale && vnp_OrderInfo && vnp_OrderType &&
        vnp_ReturnUrl && vnp_TmnCode && vnp_TxnRef && vnp_Version && vnp_SecureHash
    ) {
        // Tạo object payment request với các tham số đã decode
        const request: VnpayPaymentRequest = {
            vnp_Amount,
            vnp_Command,
            vnp_CreateDate,
            vnp_CurrCode,
            vnp_IpAddr,
            vnp_Locale,
            vnp_OrderInfo: decodeURIComponent(vnp_OrderInfo),    // Decode URL encoding
            vnp_OrderType,
            vnp_ReturnUrl: decodeURIComponent(vnp_ReturnUrl),    // Decode URL encoding
            vnp_TmnCode,
            vnp_TxnRef,
            vnp_Version,
            vnp_SecureHash
        };

        // Lưu vào cookie với tên duy nhất cho user và tour
        const cookieName = `payment_request_${username}_${tourCode}`;
        const cookieValue = JSON.stringify(request);  // Không encode để tránh double encoding
        document.cookie = `${cookieName}=${cookieValue}; path=/; max-age=86400`; // 24 giờ
        
        return request;
    }

    return null;
};

/**
 * Xây dựng URL thanh toán từ object request
 * Hàm này tạo lại URL thanh toán từ dữ liệu đã lưu trong cookie
 * 
 * @param baseUrl - URL cơ sở của cổng thanh toán
 * @param data - Object chứa thông tin thanh toán
 * @returns URL thanh toán hoàn chỉnh
 */
export const buildPaymentUrl = (
    baseUrl: string,
    data: VnpayPaymentRequest
): string => {
    // Tạo URLSearchParams để xây dựng query string
    const params = new URLSearchParams();
    
    // Thêm các tham số vào URL (URLSearchParams sẽ tự động encode)
    params.set("vnp_Amount", data.vnp_Amount);
    params.set("vnp_Command", data.vnp_Command);
    params.set("vnp_CreateDate", data.vnp_CreateDate);
    params.set("vnp_CurrCode", data.vnp_CurrCode);
    params.set("vnp_IpAddr", data.vnp_IpAddr);
    params.set("vnp_Locale", data.vnp_Locale);
    params.set("vnp_OrderInfo", data.vnp_OrderInfo);        // Không encode thủ công
    params.set("vnp_OrderType", data.vnp_OrderType);
    params.set("vnp_ReturnUrl", data.vnp_ReturnUrl);        // Không encode thủ công
    params.set("vnp_TmnCode", data.vnp_TmnCode);
    params.set("vnp_TxnRef", data.vnp_TxnRef);
    params.set("vnp_Version", data.vnp_Version);
    params.set("vnp_SecureHash", data.vnp_SecureHash);

    // Trả về URL hoàn chỉnh
    return `${baseUrl}?${params.toString()}`;
};

/**
 * Lấy thông tin payment request từ cookie
 * Hàm này đọc và parse dữ liệu từ cookie đã lưu trước đó
 * 
 * @param username - Tên người dùng
 * @param tourCode - Mã tour
 * @returns VnpayPaymentRequest object hoặc null nếu không tìm thấy
 */
export const getPaymentRequestFromCookie = (
    username: string,
    tourCode: string
): VnpayPaymentRequest | null => {
    // Tạo tên cookie duy nhất
    const cookieName = `payment_request_${username}_${tourCode}`;
    
    // Tìm cookie trong document.cookie
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${cookieName.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}=([^;]*)`)
    );

    if (match) {
        try {
            // Parse JSON từ cookie value
            return JSON.parse(match[1]);  // Không decode vì đã lưu raw JSON
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("Lỗi parse payment request từ cookie: ", e.message);
            } else {
                console.error("Lỗi parse payment request từ cookie:\n", e);
            }
        }
    }

    return null;
};

/**
 * Tạo thông tin thanh toán từ tour
 * Hàm này tạo PaymentInfo object để gửi lên server tạo đơn hàng
 * 
 * @param tour - Thông tin tour
 * @param userinfo - Thông tin người dùng
 * @returns PaymentInfo object hoặc null nếu không có user info
 */
export const createPaymentRequest = (tour: Tour, userinfo: UserInfo | null): PaymentInfo | null => {
    if (userinfo != null) {
        // Tạo IP ngẫu nhiên cho demo (trong thực tế nên lấy IP thật)
        const generateRandomIP = (): string => {
            return Array(4)
                .fill(0)
                .map(() => Math.floor(Math.random() * 256))
                .join(".");
        };
        
        return {
            "orderType": "billpayment",                                    // Loại đơn hàng
            "amount": tour.priceValue,                                     // Số tiền
            "orderDescription": `Thanh toán phí đặt tour ${tour.tourCode}`, // Mô tả
            "name": `${userinfo.username}`,                                // Tên người dùng
            "tourCode": tour.tourCode,                                     // Mã tour
            "ip": generateRandomIP()                                       // IP khách hàng
        };
    } else {
        return null;
    }
};

// ============================================================================
// TOUR CORE SERVICES
// ============================================================================

import type { TourSummary } from "./app/src/dtos/tour.dto";
import { getListFromCookie, saveListToCookies } from "./app/src/services/cookies/Cookies";

/**
 * Lấy danh sách tất cả tour summary
 * Hàm này fetch dữ liệu tour từ server và trả về danh sách tóm tắt
 * 
 * @returns Promise<TourSummary[]> - Danh sách tour summary
 */
export const fetchAllTourSummaries = async (): Promise<TourSummary[]> => {
    const data: TourSummary[] = [];
    
    try {
        const response = await api.get<TourSummary[]>('/tours/summaries');
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Lấy danh sách tour thất bại: ${error.message}`);
        } else {
            console.error(`Lấy danh sách tour thất bại:\n${error}`);
        }
        return data;
    }
};

/**
 * Lấy chi tiết tour theo mã tour
 * Hàm này fetch thông tin chi tiết của một tour cụ thể
 * 
 * @param tourCode - Mã tour cần lấy chi tiết
 * @returns Promise<Tour | null> - Thông tin tour chi tiết hoặc null nếu lỗi
 */
export const fetchTourDetail = async (tourCode: string): Promise<Tour | null> => {
    try {
        const response = await api.get<Tour>(`/tours/${tourCode}`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Lấy chi tiết tour thất bại: ${error.message}`);
        } else {
            console.error(`Lấy chi tiết tour thất bại:\n${error}`);
        }
        return null;
    }
};

/**
 * Tìm kiếm tour theo tags
 * Hàm này tìm kiếm tour dựa trên các tags được cung cấp
 * 
 * @param tags - Mảng các tags để tìm kiếm
 * @returns Promise<TourSummary[]> - Danh sách tour phù hợp
 */
export const fetchSummaryToursByTags = async (tags: string[]): Promise<TourSummary[]> => {
    try {
        const response = await api.post<TourSummary[]>('/tours/search-by-tags', { tags });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Tìm kiếm tour theo tags thất bại: ${error.message}`);
        } else {
            console.error(`Tìm kiếm tour theo tags thất bại:\n${error}`);
        }
        return [];
    }
};

/**
 * Tìm tour tương tự
 * Hàm này tìm các tour tương tự với tour hiện tại
 * 
 * @param tourCode - Mã tour hiện tại
 * @returns Promise<TourSummary[]> - Danh sách tour tương tự
 */
export const fetchSimilarTours = async (tourCode: string): Promise<TourSummary[]> => {
    try {
        const response = await api.get<TourSummary[]>(`/tours/${tourCode}/similar`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Lấy tour tương tự thất bại: ${error.message}`);
        } else {
            console.error(`Lấy tour tương tự thất bại:\n${error}`);
        }
        return [];
    }
};

/**
 * Cập nhật lượt xem tour
 * Hàm này tăng số lượt xem của tour khi user xem chi tiết
 * 
 * @param tourCode - Mã tour cần cập nhật lượt xem
 * @returns Promise<boolean> - True nếu thành công, false nếu thất bại
 */
export const updateTourViewer = async (tourCode: string): Promise<boolean> => {
    try {
        await api.post(`/tours/${tourCode}/view`);
        return true;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Cập nhật lượt xem tour thất bại: ${error.message}`);
        } else {
            console.error(`Cập nhật lượt xem tour thất bại:\n${error}`);
        }
        return false;
    }
};

// ============================================================================
// USER CORE SERVICES
// ============================================================================

/**
 * Lấy thông tin user từ cookie
 * Hàm này đọc thông tin user đã lưu trong cookie
 * 
 * @returns UserInfo | null - Thông tin user hoặc null nếu chưa đăng nhập
 */
export const getUserInfoFromCookie = (): UserInfo | null => {
    try {
        const userInfoStr = getListFromCookie("user_info");
        if (userInfoStr && userInfoStr.length > 0) {
            return userInfoStr[0] as UserInfo;
        }
        return null;
    } catch (error: unknown) {
        console.error("Lỗi đọc thông tin user từ cookie:", error);
        return null;
    }
};

/**
 * Lưu thông tin user vào cookie
 * Hàm này lưu thông tin user vào cookie để duy trì session
 * 
 * @param userInfo - Thông tin user cần lưu
 * @returns boolean - True nếu thành công, false nếu thất bại
 */
export const saveUserInfoToCookie = (userInfo: UserInfo): boolean => {
    try {
        saveListToCookies("user_info", [userInfo]);
        return true;
    } catch (error: unknown) {
        console.error("Lỗi lưu thông tin user vào cookie:", error);
        return false;
    }
};

/**
 * Xóa thông tin user khỏi cookie
 * Hàm này xóa thông tin user khi logout
 * 
 * @returns boolean - True nếu thành công, false nếu thất bại
 */
export const clearUserInfoFromCookie = (): boolean => {
    try {
        // Xóa cookie bằng cách set giá trị rỗng và expire trong quá khứ
        document.cookie = "user_info=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        return true;
    } catch (error: unknown) {
        console.error("Lỗi xóa thông tin user khỏi cookie:", error);
        return false;
    }
};

/**
 * Kiểm tra user đã đăng nhập chưa
 * Hàm này kiểm tra xem có thông tin user trong cookie không
 * 
 * @returns boolean - True nếu đã đăng nhập, false nếu chưa
 */
export const isUserLoggedIn = (): boolean => {
    const userInfo = getUserInfoFromCookie();
    return userInfo !== null && userInfo.username !== undefined;
};

/**
 * Lấy username của user hiện tại
 * Hàm này trả về username của user đang đăng nhập
 * 
 * @returns string | null - Username hoặc null nếu chưa đăng nhập
 */
export const getCurrentUsername = (): string | null => {
    const userInfo = getUserInfoFromCookie();
    return userInfo?.username || null;
};

/**
 * Validate thông tin user
 * Hàm này kiểm tra tính hợp lệ của thông tin user
 * 
 * @param userInfo - Thông tin user cần validate
 * @returns boolean - True nếu hợp lệ, false nếu không
 */
export const validateUserInfo = (userInfo: UserInfo): boolean => {
    // Kiểm tra các trường bắt buộc
    if (!userInfo.username || userInfo.username.trim() === '') {
        return false;
    }
    
    if (!userInfo.email || userInfo.email.trim() === '') {
        return false;
    }
    
    // Kiểm tra format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
        return false;
    }
    
    return true;
};

// ============================================================================
// TAG CORE SERVICES
// ============================================================================

/**
 * Lấy danh sách tags từ cookie
 * Hàm này đọc danh sách tags đã lưu trong cookie
 * 
 * @returns string[] - Danh sách tags hoặc mảng rỗng nếu không có
 */
export const getTagsFromCookie = (): string[] => {
    try {
        const tags = getListFromCookie("tags");
        return tags || [];
    } catch (error: unknown) {
        console.error("Lỗi đọc tags từ cookie:", error);
        return [];
    }
};

/**
 * Lưu danh sách tags vào cookie
 * Hàm này lưu danh sách tags vào cookie để cache
 * 
 * @param tags - Danh sách tags cần lưu
 * @returns boolean - True nếu thành công, false nếu thất bại
 */
export const saveTagsToCookie = (tags: string[]): boolean => {
    try {
        saveListToCookies("tags", tags);
        return true;
    } catch (error: unknown) {
        console.error("Lỗi lưu tags vào cookie:", error);
        return false;
    }
};

/**
 * Tìm kiếm tags từ server
 * Hàm này gọi API để tìm kiếm tags theo keyword
 * 
 * @param keyword - Từ khóa tìm kiếm
 * @returns Promise<string[]> - Danh sách tags phù hợp
 */
export const searchTagsFromServer = async (keyword: string): Promise<string[]> => {
    try {
        const response = await api.get<string[]>(`/tags/search?keyword=${encodeURIComponent(keyword)}`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Tìm kiếm tags thất bại: ${error.message}`);
        } else {
            console.error(`Tìm kiếm tags thất bại:\n${error}`);
        }
        return [];
    }
};

/**
 * Cập nhật danh sách tags
 * Hàm này thêm tags mới vào danh sách hiện có và lưu vào cookie
 * 
 * @param newTags - Danh sách tags mới cần thêm
 * @param currentTags - Danh sách tags hiện tại
 * @returns string[] - Danh sách tags đã cập nhật
 */
export const updateTagsList = (newTags: string[], currentTags: string[]): string[] => {
    try {
        // Tạo Set để tránh trùng lặp
        const tagSet = new Set([...currentTags, ...newTags]);
        const updatedTags = Array.from(tagSet);
        
        // Lưu vào cookie
        saveTagsToCookie(updatedTags);
        
        return updatedTags;
    } catch (error: unknown) {
        console.error("Lỗi cập nhật danh sách tags:", error);
        return currentTags;
    }
};

/**
 * Fetch tags nếu cần thiết
 * Hàm này kiểm tra tags local trước, nếu không có thì fetch từ server
 * 
 * @param keyword - Từ khóa tìm kiếm
 * @param currentTags - Danh sách tags hiện tại
 * @returns Promise<string[]> - Danh sách tags (local + server)
 */
export const fetchTagsIfNeeded = async (keyword: string, currentTags: string[]): Promise<string[]> => {
    try {
        // Tìm kiếm trong tags local trước
        const localMatches = currentTags.filter(tag => 
            tag.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Nếu có kết quả local, trả về luôn
        if (localMatches.length > 0) {
            return localMatches;
        }
        
        // Nếu không có, fetch từ server
        const serverTags = await searchTagsFromServer(keyword);
        
        // Cập nhật danh sách tags với tags mới từ server
        if (serverTags.length > 0) {
            const updatedTags = updateTagsList(serverTags, currentTags);
            return serverTags;
        }
        
        return [];
    } catch (error: unknown) {
        console.error("Lỗi fetch tags:", error);
        return [];
    }
};

/**
 * Lọc tags theo keyword
 * Hàm này lọc danh sách tags theo từ khóa và loại bỏ tags đã chọn
 * 
 * @param tags - Danh sách tags gốc
 * @param keyword - Từ khóa tìm kiếm
 * @param selectedTags - Danh sách tags đã chọn (sẽ bị loại bỏ)
 * @returns string[] - Danh sách tags đã lọc
 */
export const filterTagsByKeyword = (
    tags: string[], 
    keyword: string, 
    selectedTags: string[]
): string[] => {
    return tags.filter(tag => 
        tag.toLowerCase().includes(keyword.toLowerCase()) &&
        !selectedTags.includes(tag)
    );
};

/**
 * Sắp xếp tags theo độ dài
 * Hàm này sắp xếp tags theo thứ tự độ dài tăng dần
 * 
 * @param tags - Danh sách tags cần sắp xếp
 * @returns string[] - Danh sách tags đã sắp xếp
 */
export const sortTagsByLength = (tags: string[]): string[] => {
    return [...tags].sort((a, b) => a.length - b.length);
};

// ============================================================================
// 🚧 CHỨC NĂNG CHƯA IMPLEMENT - CẦN PHÁT TRIỂN
// ============================================================================

// ============================================================================
// TITLE: PAYMENT CALLBACK & STATUS UPDATE
// ============================================================================

/**
 * Cập nhật trạng thái thanh toán
 * Hàm này được gọi khi user quay lại từ trang thanh toán VNPAY
 * 
 * @param paymentData - Dữ liệu thanh toán từ VNPAY callback
 * @returns Promise<boolean> - True nếu cập nhật thành công, false nếu thất bại
 */
export const updatePaymentStatus = async (paymentData: any): Promise<boolean> => {
    try {
        const response = await api.post('/pay/update-status', paymentData);
        return response.status === 200;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Cập nhật trạng thái thanh toán thất bại: ${error.message}`);
        } else {
            console.error(`Cập nhật trạng thái thanh toán thất bại:\n${error}`);
        }
        return false;
    }
};

/**
 * Xử lý callback từ VNPAY
 * Hàm này parse dữ liệu từ URL callback và cập nhật trạng thái
 * 
 * @param url - URL callback từ VNPAY
 * @returns Promise<{success: boolean, message: string}> - Kết quả xử lý
 */
export const handleVnpayCallback = async (url: string): Promise<{success: boolean, message: string}> => {
    try {
        const params = new URLSearchParams(new URL(url).search);
        
        // Lấy các tham số quan trọng từ callback
        const vnp_ResponseCode = params.get("vnp_ResponseCode");
        const vnp_TxnRef = params.get("vnp_TxnRef");
        const vnp_Amount = params.get("vnp_Amount");
        const vnp_SecureHash = params.get("vnp_SecureHash");
        
        // Kiểm tra response code
        if (vnp_ResponseCode === "00") {
            // Thanh toán thành công
            const paymentData = {
                txnRef: vnp_TxnRef,
                amount: vnp_Amount,
                responseCode: vnp_ResponseCode,
                secureHash: vnp_SecureHash,
                status: "SUCCESS"
            };
            
            const success = await updatePaymentStatus(paymentData);
            return {
                success,
                message: success ? "Thanh toán thành công!" : "Cập nhật trạng thái thất bại"
            };
        } else {
            // Thanh toán thất bại
            const paymentData = {
                txnRef: vnp_TxnRef,
                amount: vnp_Amount,
                responseCode: vnp_ResponseCode,
                secureHash: vnp_SecureHash,
                status: "FAILED"
            };
            
            await updatePaymentStatus(paymentData);
            return {
                success: false,
                message: `Thanh toán thất bại. Mã lỗi: ${vnp_ResponseCode}`
            };
        }
    } catch (error: unknown) {
        console.error("Lỗi xử lý callback VNPAY:", error);
        return {
            success: false,
            message: "Lỗi xử lý callback thanh toán"
        };
    }
};

// ============================================================================
// TITLE: TOUR HISTORY & RECOMMENDATION SYSTEM
// ============================================================================

/**
 * Lưu tour vào lịch sử xem
 * Hàm này được gọi khi user xem chi tiết tour
 * 
 * @param tourCode - Mã tour đang xem
 * @param username - Tên người dùng (nếu đã đăng nhập)
 * @returns boolean - True nếu thành công, false nếu thất bại
 */
export const saveTourToHistory = (tourCode: string, username?: string): boolean => {
    try {
        const cookieName = username ? `tour_history_${username}` : 'tour_history_guest';
        const currentHistory = getListFromCookie(cookieName) || [];
        
        // Thêm tour mới vào đầu danh sách
        const newHistory = [tourCode, ...currentHistory.filter(code => code !== tourCode)];
        
        // Giới hạn lịch sử tối đa 20 tour
        const limitedHistory = newHistory.slice(0, 20);
        
        saveListToCookies(cookieName, limitedHistory);
        return true;
    } catch (error: unknown) {
        console.error("Lỗi lưu tour vào lịch sử:", error);
        return false;
    }
};

/**
 * Lấy lịch sử xem tour
 * Hàm này trả về danh sách các tour đã xem gần đây
 * 
 * @param username - Tên người dùng (nếu đã đăng nhập)
 * @returns string[] - Danh sách mã tour đã xem
 */
export const getTourHistory = (username?: string): string[] => {
    try {
        const cookieName = username ? `tour_history_${username}` : 'tour_history_guest';
        return getListFromCookie(cookieName) || [];
    } catch (error: unknown) {
        console.error("Lỗi lấy lịch sử tour:", error);
        return [];
    }
};

/**
 * Tìm tour liên quan dựa trên lịch sử
 * Hàm này tìm các tour tương tự với các tour đã xem
 * 
 * @param username - Tên người dùng (nếu đã đăng nhập)
 * @param limit - Số lượng tour tối đa trả về
 * @returns Promise<TourSummary[]> - Danh sách tour liên quan
 */
export const fetchRelatedToursFromHistory = async (username?: string, limit: number = 10): Promise<TourSummary[]> => {
    try {
        const history = getTourHistory(username);
        if (history.length === 0) {
            return [];
        }
        
        // Lấy 5 tour gần nhất từ lịch sử
        const recentTours = history.slice(0, 5);
        
        // Gọi API để lấy tour liên quan
        const response = await api.post<TourSummary[]>('/tours/related-from-history', {
            tourCodes: recentTours,
            limit: limit
        });
        
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Lấy tour liên quan từ lịch sử thất bại: ${error.message}`);
        } else {
            console.error(`Lấy tour liên quan từ lịch sử thất bại:\n${error}`);
        }
        return [];
    }
};

// ============================================================================
// TITLE: TOUR LIKES & FAVORITES SYSTEM
// ============================================================================

/**
 * Thêm/xóa tour khỏi danh sách yêu thích
 * Hàm này toggle trạng thái like của tour
 * 
 * @param tourCode - Mã tour cần toggle like
 * @param username - Tên người dùng
 * @returns Promise<boolean> - True nếu thành công, false nếu thất bại
 */
export const toggleTourLike = async (tourCode: string, username: string): Promise<boolean> => {
    try {
        const response = await api.post(`/tours/${tourCode}/toggle-like`, { username });
        return response.status === 200;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Toggle like tour thất bại: ${error.message}`);
        } else {
            console.error(`Toggle like tour thất bại:\n${error}`);
        }
        return false;
    }
};

/**
 * Lấy danh sách tour yêu thích
 * Hàm này trả về danh sách tour mà user đã like
 * 
 * @param username - Tên người dùng
 * @returns Promise<TourSummary[]> - Danh sách tour yêu thích
 */
export const fetchLikedTours = async (username: string): Promise<TourSummary[]> => {
    try {
        const response = await api.get<TourSummary[]>(`/users/${username}/liked-tours`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Lấy danh sách tour yêu thích thất bại: ${error.message}`);
        } else {
            console.error(`Lấy danh sách tour yêu thích thất bại:\n${error}`);
        }
        return [];
    }
};

/**
 * Tìm tour liên quan dựa trên danh sách yêu thích
 * Hàm này tìm các tour tương tự với các tour đã like
 * 
 * @param username - Tên người dùng
 * @param limit - Số lượng tour tối đa trả về
 * @returns Promise<TourSummary[]> - Danh sách tour liên quan
 */
export const fetchRelatedToursFromLikes = async (username: string, limit: number = 10): Promise<TourSummary[]> => {
    try {
        const response = await api.get<TourSummary[]>(`/users/${username}/related-from-likes?limit=${limit}`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.log(`Lấy tour liên quan từ likes thất bại: ${error.message}`);
        } else {
            console.error(`Lấy tour liên quan từ likes thất bại:\n${error}`);
        }
        return [];
    }
}; 