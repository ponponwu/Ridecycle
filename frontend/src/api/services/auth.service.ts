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
        return apiClient.post<ILoginResponse>('login', data)
    }

    /**
     * 用戶註冊
     * @param {IRegisterRequest} data - 註冊請求數據
     * @returns {Promise<IRegisterResponse>} 註冊響應 (主要包含用戶資訊)
     */
    public async register(data: IRegisterRequest): Promise<IRegisterResponse> {
        return apiClient.post<IRegisterResponse>('register', data)
    }

    /**
     * 社交媒體登錄
     * @param {ISocialLoginRequest} data - 社交登錄請求數據
     * @returns {Promise<ILoginResponse>} 登錄響應
     */
    public async socialLogin(data: ISocialLoginRequest): Promise<ILoginResponse> {
        return apiClient.post<ILoginResponse>(`auth/${data.provider}/callback`, data)
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
        const response = await apiClient.get<{ user: IUser | null }>('me')
        if (response && response.user) {
            return response.user
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

        return apiClient.patch<IUser>('profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    /**
     * 修改密碼
     * @param {IChangePasswordRequest} data - 修改密碼請求
     * @returns {Promise<{ message: string }>} 操作結果
     */
    public async changePassword(data: IChangePasswordRequest): Promise<{ message: string }> {
        return apiClient.patch<{ message: string }>('change-password', data)
    }

    /**
     * 請求重設密碼（忘記密碼）
     * @param {IForgotPasswordRequest} data - 忘記密碼請求
     * @returns {Promise<{ message: string }>} 操作結果
     */
    public async forgotPassword(data: IForgotPasswordRequest): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>('forgot-password', data)
    }

    /**
     * 重設密碼
     * @param {IResetPasswordRequest} data - 重設密碼請求
     * @returns {Promise<{ message: string }>} 操作結果
     */
    public async resetPassword(data: IResetPasswordRequest): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>('reset-password', data)
    }

    /**
     * 驗證電子郵件
     * @param {string} token - 驗證 token
     * @returns {Promise<IVerificationResponse>} 驗證結果
     */
    public async verifyEmail(token: string): Promise<IVerificationResponse> {
        return apiClient.get<IVerificationResponse>(`verify-email?token=${token}`)
    }

    /**
     * 重新發送驗證郵件
     * @returns {Promise<{ message: string }>} 操作結果
     */
    public async resendVerificationEmail(): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>('resend-verification')
    }
}

export const authService = new AuthService()
export default authService
