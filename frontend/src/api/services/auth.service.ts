// src/api/services/auth.service.ts
import apiClient from '../client'
import {
    IUser,
    ILoginRequest,
    ILoginResponse,
    IRegisterRequest,
    IRegisterResponse,
    ISocialLoginRequest,
    IChangePasswordRequest,
    IResetPasswordRequest,
    IForgotPasswordRequest,
    IUpdateProfileRequest,
    IVerificationResponse,
} from '@/types/auth.types'

/**
 * 認證相關 API 服務
 */
export class AuthService {
    /**
     * 用戶登錄
     * @param {ILoginRequest} data - 登錄請求數據
     * @returns {Promise<ILoginResponse>} 登錄響應 (主要包含用戶資訊)
     */
    public async login(data: ILoginRequest): Promise<ILoginResponse> {
        const response = await apiClient.post<IUser>('login', { data })
        // API client 的 post 方法返回 JSONAPIResponse，需要提取 data
        const userData = Array.isArray(response.data) ? response.data[0] : response.data
        return {
            user: userData,
            token: '', // 後端使用 cookie，不返回 token
            expiresAt: 0,
        }
    }

    /**
     * 用戶註冊
     * @param {IRegisterRequest} data - 註冊請求數據
     * @returns {Promise<IRegisterResponse>} 註冊響應 (主要包含用戶資訊)
     */
    public async register(data: IRegisterRequest): Promise<IRegisterResponse> {
        const response = await apiClient.post<IUser>('register', { data })
        // API client 的 post 方法返回 JSONAPIResponse，需要提取 data
        const userData = Array.isArray(response.data) ? response.data[0] : response.data
        return {
            user: userData,
            token: '', // 後端使用 cookie，不返回 token
            expiresAt: 0,
        }
    }

    /**
     * 社交媒體登錄
     * @param {ISocialLoginRequest} data - 社交登錄請求數據
     * @returns {Promise<ILoginResponse>} 登錄響應
     */
    public async socialLogin(data: ISocialLoginRequest): Promise<ILoginResponse> {
        const response = await apiClient.getData<{ user: IUser }>(`auth/${data.provider}/callback`, { data })
        const userData = Array.isArray(response) ? response[0] : response
        return {
            user: userData.user,
            token: '', // 後端使用 cookie，不返回 token
            expiresAt: 0,
        }
    }

    /**
     * 用戶登出
     * @returns {Promise<void>}
     */
    public async logout(): Promise<void> {
        await apiClient.post('logout')
    }

    /**
     * 獲取當前用戶信息
     * @returns {Promise<IUser>} 用戶信息
     */
    public async getCurrentUser(): Promise<IUser> {
        // getData 方法已經處理了 JSON:API 格式，直接返回用戶物件
        const userData = await apiClient.getData<IUser>('me')

        // 如果是陣列（不應該是），取第一個元素
        if (Array.isArray(userData)) {
            if (userData.length > 0) {
                return userData[0]
            }
            throw new Error('Empty user data array from /me endpoint.')
        }

        // 檢查是否為有效的用戶物件
        if (userData && typeof userData === 'object' && 'id' in userData) {
            return userData
        }

        throw new Error('No valid user data from /me endpoint.')
    }

    /**
     * 更新用戶資料
     * @param {IUpdateProfileRequest} data - 資料更新請求
     * @returns {Promise<IUser>} 更新後的用戶信息
     */
    public async updateProfile(data: IUpdateProfileRequest): Promise<IUser> {
        const formData = new FormData()

        if (data.fullName) formData.append('fullName', data.fullName)
        if (data.phone) formData.append('phone', data.phone)
        if (data.address) formData.append('address', data.address)
        if (data.avatar) formData.append('avatar', data.avatar)

        const response = await apiClient.getData<IUser>('profile', {
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        return Array.isArray(response) ? response[0] : response
    }

    /**
     * 修改密碼
     * @param {IChangePasswordRequest} data - 修改密碼請求
     * @returns {Promise<{ message: string }>} 操作結果
     */
    public async changePassword(data: IChangePasswordRequest): Promise<{ message: string }> {
        const response = await apiClient.getData<{ message: string }>('change-password', { data })
        return Array.isArray(response) ? response[0] : response
    }

    /**
     * 請求重設密碼（忘記密碼）
     * @param {IForgotPasswordRequest} data - 忘記密碼請求
     * @returns {Promise<{ message: string }>} 操作結果
     */
    public async forgotPassword(data: IForgotPasswordRequest): Promise<{ message: string }> {
        const response = await apiClient.getData<{ message: string }>('forgot-password', { data })
        return Array.isArray(response) ? response[0] : response
    }

    /**
     * 重設密碼
     * @param {IResetPasswordRequest} data - 重設密碼請求
     * @returns {Promise<{ message: string }>} 操作結果
     */
    public async resetPassword(data: IResetPasswordRequest): Promise<{ message: string }> {
        const response = await apiClient.getData<{ message: string }>('reset-password', { data })
        return Array.isArray(response) ? response[0] : response
    }

    /**
     * 驗證電子郵件
     * @param {string} token - 驗證 token
     * @returns {Promise<IVerificationResponse>} 驗證結果
     */
    public async verifyEmail(token: string): Promise<IVerificationResponse> {
        const response = await apiClient.getData<IVerificationResponse>(`verify-email?token=${token}`)
        return Array.isArray(response) ? response[0] : response
    }

    /**
     * 重新發送驗證郵件
     * @returns {Promise<{ message: string }>} 操作結果
     */
    public async resendVerificationEmail(): Promise<{ message: string }> {
        const response = await apiClient.getData<{ message: string }>('resend-verification')
        return Array.isArray(response) ? response[0] : response
    }
}

export const authService = new AuthService()
export default authService
