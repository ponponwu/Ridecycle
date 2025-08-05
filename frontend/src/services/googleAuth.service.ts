/**
 * Modern Google OAuth Service using @react-oauth/google
 * 使用現代React套件的Google登入實作
 */

import { googleLogout } from '@react-oauth/google'
import apiClient from '@/api/client'

interface GoogleCredentialResponse {
    credential: string
    select_by: string
}

interface GoogleUser {
    id: string
    email: string
    name: string
    picture: string
}

class ModernGoogleAuthService {
    private clientId: string

    constructor() {
        // 從環境變數獲取 Google Client ID
        this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    }

    /**
     * 處理Google憑證回應
     */
    async handleCredentialResponse(response: GoogleCredentialResponse): Promise<void> {
        try {
            // 發送憑證到後端進行驗證
            await this.sendCredentialToBackend(response.credential)
        } catch (error) {
            console.error('Google credential processing error:', error)
            this.dispatchErrorEvent('Failed to process Google credential')
        }
    }

    /**
     * 發送憑證到後端驗證
     */
    private async sendCredentialToBackend(credential: string): Promise<void> {
        try {
            // 確保 API Client 已初始化並有 CSRF token
            await apiClient.initialize()
            
            const userData = await apiClient.post('auth/google/callback', {
                credential: credential,
            })

            // 觸發成功事件
            this.dispatchSuccessEvent(userData)
            // 重定向到首頁
            window.location.href = '/'
        } catch (error) {
            console.error('Google login API error:', error)
            this.dispatchErrorEvent({ message: 'Network error occurred' })
        }
    }

    /**
     * 登出
     */
    signOut(): void {
        googleLogout()
    }

    /**
     * 取得Client ID
     */
    getClientId(): string {
        return this.clientId
    }

    /**
     * 觸發成功事件
     */
    private dispatchSuccessEvent(userData: unknown): void {
        window.dispatchEvent(
            new CustomEvent('googleLoginSuccess', {
                detail: userData,
            })
        )
    }

    /**
     * 觸發錯誤事件
     */
    private dispatchErrorEvent(error: unknown): void {
        window.dispatchEvent(
            new CustomEvent('googleLoginError', {
                detail: error,
            })
        )
    }
}

export const modernGoogleAuthService = new ModernGoogleAuthService()
export default ModernGoogleAuthService
