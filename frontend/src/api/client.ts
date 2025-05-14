// src/api/client.ts
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
    AxiosRequestHeaders,
} from 'axios'
import applyCaseMiddleware from 'axios-case-converter'
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

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retryAttempted?: boolean
}

interface ErrorResponseData {
    message?: string
    error?: string
    errors?: string[] | { [key: string]: string[] }
}

// 定義 JSON:API 相關的類型
interface JSONAPIAttributes {
    [key: string]: unknown
    price?: string | number
    sellerInfo?: { id: number; name: string; email?: string }
    user?: { id: number; name: string; email?: string }
}

interface JSONAPIResource<T extends JSONAPIAttributes = JSONAPIAttributes> {
    id: string
    type: string
    attributes: T
    relationships?: Record<string, unknown>
}

interface JSONAPIResponse<T extends JSONAPIAttributes = JSONAPIAttributes> {
    data: JSONAPIResource<T> | JSONAPIResource<T>[]
    included?: JSONAPIResource<JSONAPIAttributes>[]
    meta?: Record<string, unknown>
}

// 改進的處理函數，支援集合和單一資源
function processJSONAPIResponse<T>(response: unknown): T {
    // 如果不是物件或為 null，直接返回
    if (!response || typeof response !== 'object') {
        return response as T
    }

    // 檢查是否有 data 屬性，判斷是否為 JSON:API 回應
    if ('data' in response && response.data !== null && typeof response.data === 'object') {
        const apiResponse = response as JSONAPIResponse

        // 處理集合（data 是陣列）
        if (Array.isArray(apiResponse.data)) {
            return apiResponse.data.map((item) => {
                const { id, attributes } = item
                const result = {
                    id,
                    ...attributes,
                }

                // 特殊處理某些欄位
                if (result.price && typeof result.price === 'string') {
                    result.price = parseFloat(result.price)
                }
                if (result.sellerInfo && !result.user) {
                    result.user = result.sellerInfo
                }

                return result
            }) as unknown as T
        }

        // 處理單一資源
        if ('attributes' in apiResponse.data) {
            const { id, attributes } = apiResponse.data
            const result = {
                id,
                ...attributes,
            }

            // 特殊處理某些欄位
            if (result.price && typeof result.price === 'string') {
                result.price = parseFloat(result.price)
            }
            if (result.sellerInfo && !result.user) {
                result.user = result.sellerInfo
            }

            return result as unknown as T
        }
    }

    // 不是 JSON:API 格式，返回原始資料
    return response as T
}

class ApiClient {
    private instance: AxiosInstance
    private refreshTokenPromise: Promise<void> | null = null

    constructor() {
        const baseInstance = axios.create({
            baseURL: API_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            } as AxiosRequestHeaders,
        })

        this.instance = applyCaseMiddleware(baseInstance)
        this.setupRequestInterceptor()
        this.setupResponseInterceptor()
    }

    private setupRequestInterceptor(): void {
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                config.headers = config.headers || ({} as AxiosRequestHeaders)

                if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
                    const csrfToken = this.getCsrfToken()
                    if (csrfToken) {
                        ;(config.headers as AxiosRequestHeaders)['X-CSRF-Token'] = csrfToken
                    }
                }

                config.withCredentials = true

                return config
            },
            (error: AxiosError) => {
                // console.error('ApiClient: Request error in interceptor:', error);
                return Promise.reject(error)
            }
        )
    }

    private getCsrfToken(): string | null {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.startsWith('CSRF-TOKEN=')) {
                return decodeURIComponent(cookie.substring('CSRF-TOKEN='.length))
            }
        }
        return null
    }

    private setupResponseInterceptor(): void {
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined

                const refreshUrlPath = 'auth/refresh'
                const fullRefreshUrl = `${API_URL}${refreshUrlPath}`
                const fullRefreshUrlWithSlash = `${fullRefreshUrl}/`

                if (
                    originalRequest?.url === fullRefreshUrl ||
                    originalRequest?.url === fullRefreshUrlWithSlash ||
                    originalRequest?.url === refreshUrlPath
                ) {
                    // console.warn('ApiClient: Failed request was to refresh token endpoint. Not attempting refresh again.');
                    return Promise.reject(error)
                }

                if (error.response?.status === 401 && originalRequest && !originalRequest._retryAttempted) {
                    originalRequest._retryAttempted = true
                    if (!this.refreshTokenPromise) {
                        this.refreshTokenPromise = this.refreshToken().finally(() => {
                            this.refreshTokenPromise = null
                        })
                    }
                    try {
                        await this.refreshTokenPromise
                        return this.instance(originalRequest)
                    } catch (refreshError) {
                        // console.error("ApiClient: Refresh token failed during retry logic.", refreshError);
                        this.clearAuthData()
                        return Promise.reject(refreshError)
                    }
                }
                this.handleApiError(error)
                return Promise.reject(error)
            }
        )
    }

    private async refreshToken(): Promise<void> {
        await this.instance.post('auth/refresh')
    }

    private handleApiError(error: AxiosError): void {
        let errorMessage = ERROR_MESSAGES.GENERAL
        if (error.response) {
            const status = error.response.status
            const responseData = error.response.data as ErrorResponseData | string | undefined
            let serverMessage: string | undefined

            if (typeof responseData === 'object' && responseData !== null) {
                if (responseData.message) {
                    serverMessage = responseData.message
                } else if (responseData.error) {
                    serverMessage = responseData.error
                } else if (responseData.errors) {
                    if (Array.isArray(responseData.errors)) {
                        serverMessage = responseData.errors.join(', ')
                    } else if (typeof responseData.errors === 'object') {
                        serverMessage = Object.values(responseData.errors).flat().join(', ')
                    }
                }
            } else if (typeof responseData === 'string') {
                serverMessage = responseData
            }

            switch (status) {
                case 400:
                    errorMessage = serverMessage || '無效的請求'
                    break
                case 401:
                    errorMessage = serverMessage || ERROR_MESSAGES.UNAUTHORIZED
                    break
                case 403:
                    errorMessage = serverMessage || ERROR_MESSAGES.FORBIDDEN
                    break
                case 404:
                    errorMessage = serverMessage || ERROR_MESSAGES.NOT_FOUND
                    break
                case 500:
                case 502:
                case 503:
                case 504:
                    errorMessage = serverMessage || ERROR_MESSAGES.SERVER
                    break
                default:
                    errorMessage = serverMessage || `伺服器回傳錯誤: ${status}`
            }
        } else if (error.request) {
            if (error.code === 'ECONNABORTED') {
                errorMessage = ERROR_MESSAGES.TIMEOUT
            } else {
                errorMessage = ERROR_MESSAGES.NETWORK
            }
        }
        // console.log("ApiClient: handleApiError displaying toast for error:", errorMessage);
        toast({
            variant: 'destructive',
            title: '錯誤',
            description: errorMessage,
        })
    }

    private clearAuthData(): void {
        localStorage.removeItem('user')
    }

    private redirectToLogin(): void {
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && currentPath !== '/register') {
            localStorage.setItem('auth_redirect', currentPath + window.location.search)
            window.location.href = '/login'
        }
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.get<unknown>(url, config)
        // 處理 JSON:API 結構
        return processJSONAPIResponse<T>(response.data)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        const response = await this.instance.post<unknown, AxiosResponse<unknown>, D>(url, data, config)
        // 處理 JSON:API 結構
        return processJSONAPIResponse<T>(response.data)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        const response = await this.instance.put<unknown, AxiosResponse<unknown>, D>(url, data, config)
        // 處理 JSON:API 結構
        return processJSONAPIResponse<T>(response.data)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        const response = await this.instance.patch<unknown, AxiosResponse<unknown>, D>(url, data, config)
        // 處理 JSON:API 結構
        return processJSONAPIResponse<T>(response.data)
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.delete<unknown>(url, config)
        // 處理 JSON:API 結構
        return processJSONAPIResponse<T>(response.data)
    }
}

const apiClient = new ApiClient()
export default apiClient
