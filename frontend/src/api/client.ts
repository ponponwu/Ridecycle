// src/api/client.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from '@/hooks/use-toast'

// API 基本配置
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/'
const API_TIMEOUT = 15000

// 錯誤消息
const ERROR_MESSAGES = {
    GENERAL: '發生錯誤，請稍後再試',
    NETWORK: '網絡連接錯誤，請檢查您的網絡',
    TIMEOUT: '請求超時，請稍後再試',
    UNAUTHORIZED: '未授權，請重新登入',
    FORBIDDEN: '無權訪問此資源',
    NOT_FOUND: '找不到請求的資源',
    SERVER: '伺服器錯誤，請稍後再試',
}

// API 客戶端類
class ApiClient {
    private instance: AxiosInstance
    private refreshTokenPromise: Promise<string> | null = null

    constructor() {
        // 創建 axios 實例
        this.instance = axios.create({
            baseURL: API_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })

        // 添加請求攔截器
        this.setupRequestInterceptor()

        // 添加響應攔截器
        this.setupResponseInterceptor()
    }

    // 設置請求攔截器
    private setupRequestInterceptor(): void {
        this.instance.interceptors.request.use(
            (config: AxiosRequestConfig) => {
                // 從 localStorage 獲取 token
                const token = localStorage.getItem('access_token')

                // 如果 token 存在，添加到請求頭
                if (token && config.headers) {
                    config.headers['Authorization'] = `Bearer ${token}`
                }

                return config
            },
            (error: AxiosError) => {
                console.error('Request error:', error)
                return Promise.reject(error)
            }
        )
    }

    // 設置響應攔截器
    private setupResponseInterceptor(): void {
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config

                // 檢查是否是 401 錯誤（未授權）
                if (error.response?.status === 401 && originalRequest && !originalRequest.headers._retry) {
                    // 防止多個請求同時刷新 token
                    if (this.refreshTokenPromise === null) {
                        this.refreshTokenPromise = this.refreshToken().finally(() => {
                            this.refreshTokenPromise = null
                        })
                    }

                    try {
                        // 等待 token 刷新
                        const newToken = await this.refreshTokenPromise

                        // 使用新 token 重試原始請求
                        if (originalRequest.headers) {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                            originalRequest.headers._retry = true
                        }

                        return this.instance(originalRequest)
                    } catch (refreshError) {
                        // 如果刷新 token 失敗，清除憑據並導向登入頁面
                        this.clearAuthData()
                        this.redirectToLogin()
                        return Promise.reject(refreshError)
                    }
                }

                // 處理其他錯誤
                this.handleApiError(error)
                return Promise.reject(error)
            }
        )
    }

    // 刷新 token 的方法
    private async refreshToken(): Promise<string> {
        try {
            const refreshToken = localStorage.getItem('refresh_token')

            if (!refreshToken) {
                throw new Error('No refresh token available')
            }

            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refresh_token: refreshToken,
            })

            const { access_token, refresh_token } = response.data

            // 存儲新的 token
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)

            return access_token
        } catch (error) {
            console.error('Token refresh failed:', error)
            this.clearAuthData()
            throw error
        }
    }

    // 處理 API 錯誤
    private handleApiError(error: AxiosError): void {
        let errorMessage = ERROR_MESSAGES.GENERAL

        if (error.response) {
            // 服務器回覆的錯誤
            const status = error.response.status

            switch (status) {
                case 400:
                    errorMessage = error.response.data?.message || '無效的請求'
                    break
                case 401:
                    errorMessage = ERROR_MESSAGES.UNAUTHORIZED
                    break
                case 403:
                    errorMessage = ERROR_MESSAGES.FORBIDDEN
                    break
                case 404:
                    errorMessage = ERROR_MESSAGES.NOT_FOUND
                    break
                case 500:
                    errorMessage = ERROR_MESSAGES.SERVER
                    break
                default:
                    errorMessage = `伺服器回傳錯誤: ${status}`
            }
        } else if (error.request) {
            // 請求已發送但未收到響應
            if (error.code === 'ECONNABORTED') {
                errorMessage = ERROR_MESSAGES.TIMEOUT
            } else {
                errorMessage = ERROR_MESSAGES.NETWORK
            }
        }

        // 顯示錯誤消息
        toast({
            variant: 'destructive',
            title: '錯誤',
            description: errorMessage,
        })
    }

    // 清除身份驗證數據
    private clearAuthData(): void {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
    }

    // 重定向到登入頁面
    private redirectToLogin(): void {
        // 保存當前 URL 以便登入後重定向回來
        const currentPath = window.location.pathname
        if (currentPath !== '/login') {
            localStorage.setItem('auth_redirect', currentPath)
            window.location.href = '/login'
        }
    }

    // 公共方法：發送 GET 請求
    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.get<T>(url, config)
        return response.data
    }

    // 公共方法：發送 POST 請求
    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.post<T>(url, data, config)
        return response.data
    }

    // 公共方法：發送 PUT 請求
    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.put<T>(url, data, config)
        return response.data
    }

    // 公共方法：發送 PATCH 請求
    public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.patch<T>(url, data, config)
        return response.data
    }

    // 公共方法：發送 DELETE 請求
    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.delete<T>(url, config)
        return response.data
    }
}

// 創建並導出 API 客戶端單例
const apiClient = new ApiClient()
export default apiClient
