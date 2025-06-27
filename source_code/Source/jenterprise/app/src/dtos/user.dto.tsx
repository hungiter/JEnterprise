export interface UserInfo {
    username: string
    email?: string
    role: string
    token: string
}

// Login Response
interface LoginData {
    token: string,
    username: string,
    email: string,
    role: string
    error?: string
}
export interface LoginResponse {
    success: boolean
    message: string
    data?: LoginData
    error?: string
}