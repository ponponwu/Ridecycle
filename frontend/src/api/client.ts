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

// 通用型的 JSON:API 響應處理函數
function processJSONAPIResponse<T>(response: unknown): T {
    // 非物件直接返回
    if (!response || typeof response !== 'object') {
        return response as T
    }

    // 檢查是否為 JSON:API 格式
    if ('data' in response && response.data !== null && typeof response.data === 'object') {
        const apiResponse = response as JSONAPIResponse

        // 處理集合資源
        if (Array.isArray(apiResponse.data)) {
            return apiResponse.data.map((item) => {
                const { id, attributes } = item
                const result: Record<string, unknown> = {
                    id,
                    ...attributes,
                }

                // 處理數字類型轉換
                Object.keys(result).forEach((key) => {
                    // 將字符串數字轉換為實際數字
                    if (
                        typeof result[key] === 'string' &&
                        !isNaN(Number(result[key])) &&
                        (key === 'price' || key.endsWith('Price') || key.endsWith('Amount'))
                    ) {
                        result[key] = parseFloat(result[key] as string)
                    }
                })

                return result
            }) as unknown as T
        }

        // 處理單一資源
        if ('attributes' in apiResponse.data) {
            const { id, attributes } = apiResponse.data
            const result: Record<string, unknown> = {
                id,
                ...attributes,
            }

            // 處理數字類型轉換
            Object.keys(result).forEach((key) => {
                // 將字符串數字轉換為實際數字
                if (
                    typeof result[key] === 'string' &&
                    !isNaN(Number(result[key])) &&
                    (key === 'price' || key.endsWith('Price') || key.endsWith('Amount'))
                ) {
                    result[key] = parseFloat(result[key] as string)
                }
            })

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
        // 配置 axios-case-converter 進行自動命名轉換
        const options = {
            ignoreHeaders: true, // 不轉換標頭
            caseFunctions: {
                snake: (input: string) => input.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`),
                camel: (input: string) => input.replace(/_([a-z])/g, (match, char) => char.toUpperCase()),
            },
        }

        const baseInstance = axios.create({
            baseURL: API_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            } as AxiosRequestHeaders,
        })

        this.instance = applyCaseMiddleware(baseInstance, options)
        this.setupRequestInterceptor()
        this.setupResponseInterceptor()
    }

    private setupRequestInterceptor(): void {
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                config.headers = config.headers || ({} as AxiosRequestHeaders)

                if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
                    const csrfToken = this.getCsrfToken()
                    console.log(`===== 請求方法: ${config.method}, URL: ${config.url} =====`)

                    if (csrfToken) {
                        console.log(`===== 添加 CSRF token 到請求頭: ${csrfToken.substring(0, 10)}... =====`)
                        ;(config.headers as AxiosRequestHeaders)['X-CSRF-Token'] = csrfToken
                    } else {
                        console.warn(`===== 請求缺少 CSRF token! URL: ${config.url} =====`)
                    }
                }

                config.withCredentials = true
                return config
            },
            (error: AxiosError) => {
                console.error('===== 請求攔截器錯誤:', error, '=====')
                return Promise.reject(error)
            }
        )
    }

    private getCsrfToken(): string | null {
        try {
            console.log('===== 嘗試獲取 CSRF token =====')

            // 1. 先從 cookie 中尋找
            const cookies = document.cookie.split(';')
            console.log('===== 所有 cookies:', cookies, '=====')

            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim()
                if (cookie.startsWith('CSRF-TOKEN=')) {
                    const token = decodeURIComponent(cookie.substring('CSRF-TOKEN='.length))
                    console.log('===== CSRF token 從 cookie 中找到:', token, '=====')
                    return token
                }
                if (cookie.startsWith('X-CSRF-Token=')) {
                    const token = decodeURIComponent(cookie.substring('X-CSRF-Token='.length))
                    console.log('===== CSRF token 從 X-CSRF-Token cookie 中找到:', token, '=====')
                    return token
                }
            }

            // 2. 從 meta 標籤尋找
            const metaTag = document.querySelector('meta[name="csrf-token"]')
            if (metaTag) {
                const token = metaTag.getAttribute('content')
                console.log('===== CSRF token 從 meta 標籤找到:', token, '=====')
                return token
            }

            // 3. 最後一次嘗試 - 直接向後端請求新的 token
            console.warn('===== 無法找到 CSRF token! 嘗試立即獲取新的 token =====')
            return this.fetchNewCsrfToken()
        } catch (error) {
            console.error('===== 獲取 CSRF token 時發生錯誤:', error, '=====')
            return null
        }
    }

    // 添加同步獲取新 CSRF token 的方法
    private fetchNewCsrfToken(): string | null {
        try {
            console.log('===== 同步請求新的 CSRF token =====')
            // 使用同步 XMLHttpRequest
            const xhr = new XMLHttpRequest()
            xhr.open('GET', '/api/v1/csrf-token', false) // 第三個參數 false 表示同步請求
            xhr.setRequestHeader('Accept', 'application/json')
            xhr.withCredentials = true
            xhr.send(null)

            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText)
                    if (response && response.token) {
                        console.log('===== 成功獲取新的 CSRF token =====')
                        return response.token
                    }
                } catch (e) {
                    console.error('===== 解析 CSRF token 響應失敗 =====', e)
                }
            } else {
                console.error(`===== 獲取 CSRF token 請求失敗: ${xhr.status} =====`)
            }
        } catch (error) {
            console.error('===== 同步獲取 CSRF token 失敗:', error, '=====')
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
