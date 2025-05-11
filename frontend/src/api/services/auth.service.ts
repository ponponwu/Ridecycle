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
     * @returns {Promise<ILoginResponse>} 登錄響應
     */
    public async login(data: ILoginRequest): Promise<ILoginResponse> {
        const response = await apiClient.post<ILoginResponse>('login', data)
        console.log('response', response)
        if (response.token) {
            this.setToken(response.token)
        }

        return response
    }

    /**
     * 用戶註冊
     * @param {IRegisterRequest} data - 註冊請求數據
     * @returns {Promise<IRegisterResponse>} 註冊響應
     */
    public async register(data: IRegisterRequest): Promise<IRegisterResponse> {
        const response = await apiClient.post<IRegisterResponse>('register', data)

        if (response.token) {
            this.setToken(response.token)
        }

        return response
    }

    /**
     * 社交媒體登錄
     * @param {ISocialLoginRequest} data - 社交登錄請求數據
     * @returns {Promise<ILoginResponse>} 登錄響應
     */
    public async socialLogin(data: ISocialLoginRequest): Promise<ILoginResponse> {
        const response = await apiClient.post<ILoginResponse>(`${data.provider}`, data)

        if (response.token) {
            this.setToken(response.token)
        }

        return response
    }

    /**
     * 用戶登出
     * @returns {Promise<void>}
     */
    public async logout(): Promise<void> {
        await apiClient.post('logout')
        this.clearToken()
    }

    /**
     * 獲取當前用戶信息
     * @returns {Promise<IUser>} 用戶信息
     */
    public async getCurrentUser(): Promise<IUser> {
        // The backend /api/v1/me returns { user: IUser_data_or_null }
        // We need to extract the 'user' property from the response.
        // The apiClient's baseURL is 'http://localhost:3000', and it prepends '/api/v1' if not present in path.
        // So, 'me' becomes 'http://localhost:3000/api/v1/me' or similar.
        const response = await apiClient.get<{ user: IUser | null }>('me')

        if (response && response.user) {
            return response.user
        }
        // If response.user is null (e.g., user deleted but token still valid until checked by DB),
        // or if the response structure is not as expected,
        // it's better to throw an error. This will be caught by AuthContext's useEffect
        // and lead to token removal and setting currentUser to null.
        throw new Error('Failed to retrieve valid user data from /me endpoint.')
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

    /**
     * 檢查用戶是否已登錄
     * @returns {boolean} 是否已登錄
     */
    public isAuthenticated(): boolean {
        return !!this.getToken()
    }

    /**
     * 儲存 token 到本地存儲
     * @param {string} token - 認證 token
     * @private
     */
    private setToken(token: string): void {
        // Assuming 'token' from response is the access token
        localStorage.setItem('access_token', token)
        // If your API also returns a refresh_token in the login/register response,
        // you should store it here as well, e.g.:
        // if (response.refreshToken) {
        //   localStorage.setItem('refresh_token', response.refreshToken);
        // }
    }

    /**
     * 從本地存儲獲取 token
     * @returns {string | null} 認證 token
     * @private
     */
    private getToken(): string | null {
        return localStorage.getItem('access_token')
    }

    /**
     * 清除本地存儲中的 token
     * @private
     */
    private clearToken(): void {
        localStorage.removeItem('access_token')
        // Also clear refresh_token if you are using it
        localStorage.removeItem('refresh_token')
        // It's also good practice to remove user info if stored separately
        localStorage.removeItem('user')
    }

    /**
     * 處理 OAuth 回調
     * @param {string} code - 授權碼
     * @returns {Promise<ILoginResponse>} 登錄響應
     */
    public async handleOAuthCallback(code: string): Promise<ILoginResponse> {
        const response = await apiClient.post<ILoginResponse>('/api/v1/oauth/callback', { code })

        if (response.token) {
            this.setToken(response.token)
        }

        return response
    }
}

export const authService = new AuthService()
export default authService
