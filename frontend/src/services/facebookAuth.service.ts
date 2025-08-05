/**
 * Facebook OAuth Service using native Facebook SDK
 * 使用原生 Facebook SDK 的登入實作
 */

import type { FacebookUser, FacebookAuthResponse, FacebookLoginError } from '@/types/facebook'
import apiClient from '@/api/client'

export interface FacebookLoginResponse {
    status: string
    authResponse?: {
        accessToken: string
        userID: string
        expiresIn: number
        signedRequest: string
    }
}

class FacebookAuthService {
    private appId: string

    constructor() {
        // 從環境變數獲取 Facebook App ID
        this.appId = import.meta.env.VITE_FACEBOOK_APP_ID || ''
    }

    /**
     * 檢查 Facebook SDK 是否已載入
     */
    private isFacebookSDKLoaded(): boolean {
        return typeof window !== 'undefined' && !!window.FB
    }

    /**
     * 等待 Facebook SDK 載入
     */
    private waitForFacebookSDK(timeout = 10000): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.isFacebookSDKLoaded()) {
                resolve(true)
                return
            }

            let attempts = 0
            const maxAttempts = timeout / 100

            const checkSDK = () => {
                attempts++
                if (this.isFacebookSDKLoaded()) {
                    resolve(true)
                } else if (attempts >= maxAttempts) {
                    console.warn('Facebook SDK loading timeout')
                    resolve(false)
                } else {
                    setTimeout(checkSDK, 100)
                }
            }

            setTimeout(checkSDK, 100)
        })
    }

    /**
     * 使用 Facebook SDK 進行登入
     */
    async signInWithFacebook(): Promise<void> {
        // 確保 Facebook SDK 已載入
        const sdkLoaded = await this.waitForFacebookSDK()
        if (!sdkLoaded) {
            throw new Error('Facebook SDK failed to load')
        }

        return new Promise((resolve, reject) => {
            window.FB.login(
                (response: FB.LoginResponse) => {
                    if (response.status === 'connected' && response.authResponse) {
                        this.handleLoginSuccess(response.authResponse)
                            .then(() => resolve())
                            .catch((error) => reject(error))
                    } else {
                        reject(new Error('Facebook login failed or was cancelled'))
                    }
                },
                {
                    scope: 'email,public_profile',
                    return_scopes: true,
                }
            )
        })
    }

    /**
     * 處理Facebook登入成功
     */
    async handleLoginSuccess(authResponse: FB.LoginResponse['authResponse']): Promise<void> {
        try {
            if (authResponse?.accessToken) {
                // 獲取用戶資訊
                const userInfo = await this.getUserInfo(authResponse.accessToken)
                if (userInfo) {
                    await this.sendTokenToBackend(authResponse.accessToken, userInfo)
                }
            } else {
                throw new Error('No access token received from Facebook')
            }
        } catch (error) {
            console.error('Facebook login processing error:', error)
            this.dispatchErrorEvent('Failed to process Facebook login')
        }
    }

    /**
     * 獲取用戶資訊
     */
    private async getUserInfo(accessToken: string): Promise<FacebookUser | null> {
        try {
            const response = await fetch(
                `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`
            )

            if (response.ok) {
                return await response.json()
            } else {
                console.error('Failed to get Facebook user info')
                return null
            }
        } catch (error) {
            console.error('Error fetching Facebook user info:', error)
            return null
        }
    }

    /**
     * 發送 access token 到後端驗證
     */
    private async sendTokenToBackend(accessToken: string, userInfo: FacebookUser): Promise<void> {
        try {
            // 確保 API Client 已初始化並有 CSRF token
            await apiClient.initialize()

            const userData = await apiClient.post('auth/facebook/callback', {
                access_token: accessToken,
                user_info: userInfo,
            })

            // 觸發成功事件
            this.dispatchSuccessEvent(userData)
            // 重定向到首頁
            window.location.href = '/'
        } catch (error) {
            console.error('Facebook login API error:', error)
            this.dispatchErrorEvent({ message: 'Network error occurred' })
        }
    }

    /**
     * 處理Facebook登入錯誤
     */
    handleLoginError(error: unknown): void {
        console.error('Facebook login error:', error)

        let errorMessage = 'Facebook login failed'

        if (typeof error === 'object' && error !== null) {
            const errorObj = error as { status?: string; message?: string }
            if (errorObj.status === 'facebookNotLoaded') {
                errorMessage = 'Facebook SDK not loaded. Please check your internet connection and try again.'
            } else if (errorObj.message) {
                errorMessage = errorObj.message
            }
        }

        this.dispatchErrorEvent({ message: errorMessage })
    }

    /**
     * 使用重定向方式登入 (備用方案)
     * OmniAuth 2.0 需要使用 POST 請求和 CSRF token
     */
    signInWithRedirect(): void {
        // 觸發 Facebook OAuth 重定向事件，讓組件處理 POST 表單提交
        window.dispatchEvent(new CustomEvent('facebookOAuthRedirect'))
    }

    /**
     * 取得App ID
     */
    getAppId(): string {
        return this.appId
    }

    /**
     * 觸發成功事件
     */
    private dispatchSuccessEvent(userData: unknown): void {
        window.dispatchEvent(
            new CustomEvent('facebookLoginSuccess', {
                detail: userData,
            })
        )
    }

    /**
     * 觸發錯誤事件
     */
    private dispatchErrorEvent(error: unknown): void {
        window.dispatchEvent(
            new CustomEvent('facebookLoginError', {
                detail: error,
            })
        )
    }
}

export const facebookAuthService = new FacebookAuthService()
export default FacebookAuthService
