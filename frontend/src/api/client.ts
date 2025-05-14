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

// API 基本配置 - 確保使用完整的 URL 包括協議和域名
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
    private csrfTokenPromise: Promise<string | null> | null = null
    private csrfToken: string | null = null

    constructor() {
        // 配置 axios-case-converter 進行自動命名轉換
        const options = {
            ignoreHeaders: true, // 不轉換標頭
            caseFunctions: {
                snake: (input: string) => input.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`),
                camel: (input: string) => input.replace(/_([a-z])/g, (match, char) => char.toUpperCase()),
            },
        }

        // 確保 API_URL 以斜線結尾
        const baseURL = API_URL.endsWith('/') ? API_URL : `${API_URL}/`

        const baseInstance = axios.create({
            baseURL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            } as AxiosRequestHeaders,
            withCredentials: true, // 始終發送憑證（cookies）
        })

        this.instance = applyCaseMiddleware(baseInstance, options)
        this.setupRequestInterceptor()
        this.setupResponseInterceptor()
    }

    // 公共異步初始化方法 - 在應用啟動時調用
    public async initialize(): Promise<void> {
        try {
            console.log('===== 初始化 API 客戶端 =====')
            await this.fetchCsrfToken()
            console.log('===== API 客戶端初始化完成 =====')
        } catch (error) {
            console.error('===== API 客戶端初始化失敗 =====', error)
        }
    }

    private setupRequestInterceptor(): void {
        this.instance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                config.headers = config.headers || ({} as AxiosRequestHeaders)

                // 只為非 GET/HEAD/OPTIONS 請求添加 CSRF token
                if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
                    console.log(`===== 請求方法: ${config.method}, URL: ${config.url} =====`)

                    // 如果已經有 token，直接使用
                    if (this.csrfToken) {
                        console.log(`===== 使用已有 CSRF token: ${this.csrfToken.substring(0, 10)}... =====`)
                        ;(config.headers as AxiosRequestHeaders)['X-CSRF-Token'] = this.csrfToken
                    } else {
                        // 否則獲取 token
                        try {
                            const token = await this.getCsrfToken()
                            if (token) {
                                console.log(`===== 添加 CSRF token 到請求頭: ${token.substring(0, 10)}... =====`)
                                ;(config.headers as AxiosRequestHeaders)['X-CSRF-Token'] = token
                            } else {
                                console.warn(`===== 請求缺少 CSRF token! URL: ${config.url} =====`)
                            }
                        } catch (error) {
                            console.error('===== 獲取 CSRF token 失敗 =====', error)
                        }
                    }
                }

                return config
            },
            (error: AxiosError) => {
                console.error('===== 請求攔截器錯誤:', error, '=====')
                return Promise.reject(error)
            }
        )
    }

    private async getCsrfToken(): Promise<string | null> {
        try {
            console.log('===== 嘗試獲取 CSRF token =====')

            // 如果已經有 token，直接返回
            if (this.csrfToken) {
                return this.csrfToken
            }

            // 1. 從 cookie 中獲取
            const tokenFromCookie = this.getTokenFromCookie()
            if (tokenFromCookie) {
                this.csrfToken = tokenFromCookie
                return tokenFromCookie
            }

            // 2. 從 meta 標籤獲取
            const tokenFromMeta = this.getTokenFromMeta()
            if (tokenFromMeta) {
                this.csrfToken = tokenFromMeta
                return tokenFromMeta
            }

            // 3. 如果沒有找到，從後端獲取
            return this.fetchCsrfToken()
        } catch (error) {
            console.error('===== 獲取 CSRF token 時發生錯誤:', error, '=====')
            return null
        }
    }

    private getTokenFromCookie(): string | null {
        console.log('===== 從 cookie 中查找 CSRF token =====')
        const cookies = document.cookie.split(';')
        console.log('===== 所有 cookies:', cookies, '=====')

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.startsWith('CSRF-TOKEN=')) {
                const token = decodeURIComponent(cookie.substring('CSRF-TOKEN='.length))
                console.log('===== CSRF token 從 cookie 中找到:', token.substring(0, 10) + '... =====')
                return token
            }
            if (cookie.startsWith('X-CSRF-Token=')) {
                const token = decodeURIComponent(cookie.substring('X-CSRF-Token='.length))
                console.log('===== CSRF token 從 X-CSRF-Token cookie 中找到:', token.substring(0, 10) + '... =====')
                return token
            }
        }

        console.log('===== 在 cookie 中未找到 CSRF token =====')
        return null
    }

    private getTokenFromMeta(): string | null {
        console.log('===== 從 meta 標籤查找 CSRF token =====')
        const metaTag = document.querySelector('meta[name="csrf-token"]')
        if (metaTag) {
            const token = metaTag.getAttribute('content')
            console.log('===== CSRF token 從 meta 標籤找到:', token?.substring(0, 10) + '... =====')
            return token
        }

        console.log('===== 在 meta 標籤中未找到 CSRF token =====')
        return null
    }

    // 異步獲取 CSRF token
    public async fetchCsrfToken(): Promise<string | null> {
        // 如果已經有請求在進行中，返回該請求的 promise
        if (this.csrfTokenPromise) {
            return this.csrfTokenPromise
        }

        console.log('===== 從 API 獲取新的 CSRF token =====')

        // 創建新的請求 promise
        this.csrfTokenPromise = new Promise<string | null>(async (resolve) => {
            try {
                // 使用完整的 URL，確保即使前端和 API 在不同域也能正確請求
                const response = await axios.get<{ status: string; token: string }>(`${API_URL}csrf_token`, {
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                    },
                })

                if (response.status === 200 && response.data && response.data.token) {
                    this.csrfToken = response.data.token
                    console.log('===== 成功獲取新的 CSRF token:', response.data.token.substring(0, 10) + '... =====')
                    resolve(response.data.token)
                } else {
                    console.error('===== API 返回的 CSRF token 格式不正確 =====', response.data)
                    resolve(null)
                }
            } catch (error) {
                console.error('===== 從 API 獲取 CSRF token 失敗 =====', error)
                resolve(null)
            } finally {
                // 完成後清除 promise
                this.csrfTokenPromise = null
            }
        })

        return this.csrfTokenPromise
    }

    private setupResponseInterceptor(): void {
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined

                // 處理 CSRF token 相關錯誤
                if (error.response?.status === 422 && originalRequest && !originalRequest._retryAttempted) {
                    console.log('===== 檢測到 CSRF 錯誤 (422)，嘗試獲取新 token =====')
                    try {
                        // 清除舊 token
                        this.csrfToken = null
                        // 獲取新 token
                        const newToken = await this.fetchCsrfToken()
                        if (newToken && originalRequest.headers) {
                            originalRequest._retryAttempted = true
                            originalRequest.headers['X-CSRF-Token'] = newToken
                            return this.instance(originalRequest)
                        }
                    } catch (retryError) {
                        console.error('===== CSRF token 重試失敗 =====', retryError)
                    }
                }

                const refreshUrlPath = 'auth/refresh'
                const fullRefreshUrl = `${API_URL}${refreshUrlPath}`
                const fullRefreshUrlWithSlash = `${fullRefreshUrl}/`

                // 處理 401 錯誤（未授權）
                if (
                    originalRequest?.url === fullRefreshUrl ||
                    originalRequest?.url === fullRefreshUrlWithSlash ||
                    originalRequest?.url === refreshUrlPath
                ) {
                    console.warn('===== 刷新令牌端點失敗，不再嘗試刷新 =====')
                    return Promise.reject(error)
                }

                if (error.response?.status === 401 && originalRequest && !originalRequest._retryAttempted) {
                    console.log('===== 檢測到 401 錯誤，嘗試刷新令牌 =====')
                    originalRequest._retryAttempted = true
                    if (!this.refreshTokenPromise) {
                        this.refreshTokenPromise = this.refreshToken().finally(() => {
                            this.refreshTokenPromise = null
                        })
                    }
                    try {
                        await this.refreshTokenPromise
                        console.log('===== 令牌刷新成功，重試原始請求 =====')
                        return this.instance(originalRequest)
                    } catch (refreshError) {
                        console.error('===== 令牌刷新失敗 =====', refreshError)
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
        return processJSONAPIResponse<T>(response.data)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        const response = await this.instance.post<unknown, AxiosResponse<unknown>, D>(url, data, config)
        return processJSONAPIResponse<T>(response.data)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        const response = await this.instance.put<unknown, AxiosResponse<unknown>, D>(url, data, config)
        return processJSONAPIResponse<T>(response.data)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        const response = await this.instance.patch<unknown, AxiosResponse<unknown>, D>(url, data, config)
        return processJSONAPIResponse<T>(response.data)
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.delete<unknown>(url, config)
        return processJSONAPIResponse<T>(response.data)
    }
}

const apiClient = new ApiClient()
export default apiClient
