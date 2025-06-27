import api from "../api_info";
import { AxiosError } from "axios";
import { getUserInfoFromCookie } from "@/src/context/LoginContext";

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message?: string;
    errorCode?: number;
    oldPasswordError?: string;
    newPasswordError?: string;
    confirmPasswordError?: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    errorCode?: number;
    data?: any;
    error?: AuthError;
}

export interface AuthError {
    oldPassword: string;
    newPassword: string;
}

export const changePassword = async (passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    try {
        const userInfo = getUserInfoFromCookie();
        if (!userInfo || userInfo.username === "" || userInfo.username === null) {
            return {
                success: false,
                message: "Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.",
                errorCode: 401
            };
        }

        if (passwordData.currentPassword === "" || passwordData.currentPassword === null) {
            return {
                success: false,
                oldPasswordError: "Mật khẩu hiện tại không được để trống.",
                errorCode: 400
            };
        }

        if (passwordData.newPassword === "" || passwordData.newPassword === null) {
            return {
                success: false,
                newPasswordError: "Mật khẩu mới không được để trống.",
                errorCode: 400
            };
        }

        if (passwordData.confirmPassword === "" || passwordData.confirmPassword === null) {
            return {
                success: false,
                confirmPasswordError: "Mật khẩu xác nhận không được để trống.",
                errorCode: 400
            };
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return {
                success: false,
                confirmPasswordError: "Mật khẩu mới và mật khẩu xác nhận không khớp.",
                errorCode: 400
            };
        }

        const payload = {
            username: userInfo.username,
            oldPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        };
        const response = await api.post<AuthResponse>('/auth/change-password', payload);
        return {
            success: response.data.success,
            message: response.data.message,
            errorCode: response.data.errorCode,
            oldPasswordError: response.data.error?.oldPassword,
            newPasswordError: response.data.error?.newPassword
        };
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            return {
                success: false,
                message: `Đổi mật khẩu thất bại: ${error.message}`
            };
        }
        return {
            success: false,
            message: `Đổi mật khẩu thất bại: ${error}`
        };
    }
}; 