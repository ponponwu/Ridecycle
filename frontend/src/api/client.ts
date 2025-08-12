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

// API 基本配置 - 在開發環境使用相對路徑以支援 Vite 代理
const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000')
const API_URL = `${API_BASE_URL}/api/v1/`
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
    errors?: string[] | { [key: string]: string[] } | JSONAPIError[]
}

// 添加 JSON:API 錯誤格式類型
interface JSONAPIError {
    id?: string
    status?: string
    title?: string
    detail?: string
    source?: {
        pointer?: string
        parameter?: string
    }
}

// 定義 JSON:API 相關的類型
interface JSONAPIAttributes {
    [key: string]: unknown
}

interface JSONAPIRelationship {
    data: { id: string; type: string } | { id: string; type: string }[] | null
    links?: {
        self?: string
        related?: string
    }
}

interface JSONAPIResource<T extends JSONAPIAttributes = JSONAPIAttributes> {
    id: string
    type: string
    attributes: T
    relationships?: Record<string, JSONAPIRelationship>
    links?: Record<string, string>
}

interface JSONAPIResponseData<T extends JSONAPIAttributes = JSONAPIAttributes> {
    data: JSONAPIResource<T> | JSONAPIResource<T>[]
    included?: JSONAPIResource<JSONAPIAttributes>[]
    meta?: Record<string, unknown>
    links?: {
        self?: string
        first?: string
        prev?: string
        next?: string
        last?: string
    }
}

export interface JSONAPIResponse<T> {
    data: T | T[]
    included?: any[]
    meta?: Record<string, unknown>
    links?: Record<string, string>
}

// 新增: 分頁信息接口
export interface PaginationMeta {
    currentPage: number
    totalPages: number
    totalCount: number
    perPage: number
}

// Snake case to camel case 轉換函數
function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (match, char) => char.toUpperCase())
}

// 遞歸轉換物件的所有鍵從 snake_case 到 camelCase
function convertKeysToCamelCase(obj: any, seen = new WeakMap()): any {
    if (obj === null || obj === undefined) {
        return obj
    }

    if (typeof obj === 'object') {
        if (seen.has(obj)) {
            return seen.get(obj)
        }
    }

    if (Array.isArray(obj)) {
        const newArr = []
        seen.set(obj, newArr)
        obj.forEach((item) => {
            newArr.push(convertKeysToCamelCase(item, seen))
        })
        return newArr
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
        const converted: any = {}
        seen.set(obj, converted)
        for (const [key, value] of Object.entries(obj)) {
            const camelKey = toCamelCase(key)
            let convertedValue = convertKeysToCamelCase(value, seen)

            // 處理數字類型轉換
            if (
                typeof convertedValue === 'string' &&
                !isNaN(Number(convertedValue)) &&
                convertedValue.trim() !== '' &&
                (camelKey.includes('price') ||
                    camelKey.includes('Price') ||
                    camelKey.includes('cost') ||
                    camelKey.includes('Cost') ||
                    camelKey.includes('amount') ||
                    camelKey.includes('Amount') ||
                    camelKey === 'totalPrice' ||
                    camelKey === 'shippingCost' ||
                    camelKey === 'subtotal' ||
                    camelKey === 'tax' ||
                    camelKey === 'total')
            ) {
                convertedValue = parseFloat(convertedValue)
            }

            converted[camelKey] = convertedValue
        }
        return converted
    }

    return obj
}

function processJSONAPIResponse<T>(response: unknown): JSONAPIResponse<T> | T {
    // 如果不是物件，直接返回
    if (!response || typeof response !== 'object') {
        return response as T
    }

    // 檢查是否為 JSON:API 格式
    if ('data' in response && response.data !== null && typeof response.data === 'object') {
        const apiResponse = response as JSONAPIResponseData
        const result: JSONAPIResponse<T> = {
            data: [] as unknown as T | T[],
            meta: apiResponse.meta,
            links: apiResponse.links,
        }

        // 處理集合資源
        if (Array.isArray(apiResponse.data)) {
            result.data = apiResponse.data.map((item) => {
                const { id, attributes } = item
                const convertedAttributes = convertKeysToCamelCase(attributes)
                return {
                    id,
                    ...convertedAttributes,
                } as unknown as T
            })
        }
        // 處理單一資源
        else if ('attributes' in apiResponse.data) {
            const { id, attributes } = apiResponse.data
            const convertedAttributes = convertKeysToCamelCase(attributes)
            result.data = {
                id,
                ...convertedAttributes,
            } as unknown as T
        }

        // 如果有 included 資源，也要轉換
        if (apiResponse.included) {
            result.included = apiResponse.included.map((item) => {
                const { id, type, attributes } = item
                const convertedAttributes = convertKeysToCamelCase(attributes)
                return {
                    id,
                    type,
                    ...convertedAttributes,
                }
            })
        }

        return result
    }

    // 不是 JSON:API 格式，直接轉換鍵名然後返回
    return convertKeysToCamelCase(response) as T
}

// 處理屬性的輔助函數
function processAttributes(attributes: JSONAPIAttributes): Record<string, unknown> {
    const result: Record<string, unknown> = { ...attributes }

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
}

// 新增: 提取分頁信息的輔助函數
export function extractPaginationMeta(response: JSONAPIResponse<any>): PaginationMeta | null {
    if (!response.meta) return null

    return {
        currentPage: (response.meta.currentPage as number) || (response.meta.current_page as number) || 1,
        totalPages: (response.meta.totalPages as number) || (response.meta.total_pages as number) || 0,
        totalCount: (response.meta.totalCount as number) || (response.meta.total_count as number) || 0,
        perPage: (response.meta.perPage as number) || (response.meta.per_page as number) || 10,
    }
}

// 新增: 從 JSON:API 響應中提取純數據
export function extractData<T>(response: JSONAPIResponse<T> | T): T | T[] {
    if (response && typeof response === 'object' && 'data' in response) {
        return (response as JSONAPIResponse<T>).data
    }
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
        const baseURL = API_URL.endsWith('/') ? API_URL : API_URL + '/'

        // 創建 axios 實例並應用 case 轉換中間件
        this.instance = applyCaseMiddleware(
            axios.create({
                baseURL,
                timeout: API_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                withCredentials: true,
            }),
            options
        )

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
                // 創建一個臨時的 axios 實例來獲取 CSRF token，避免循環調用
                const tempInstance = axios.create({
                    baseURL: this.instance.defaults.baseURL,
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                    },
                })
                const response = await tempInstance.get<{ status: string; token: string }>('csrf_token')

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
                // 只有當錯誤響應明確指示 CSRF 問題時才重試
                if (error.response?.status === 422 && originalRequest && !originalRequest._retryAttempted) {
                    const errorData = error.response.data as ErrorResponseData;
                    const isCSRFError = 
                        (errorData?.error && typeof errorData.error === 'string' && 
                         errorData.error.toLowerCase().includes('authenticity')) ||
                        (errorData?.message && typeof errorData.message === 'string' && 
                         errorData.message.toLowerCase().includes('authenticity')) ||
                        (Array.isArray(errorData?.errors) && 
                         errorData.errors.some((err: string | JSONAPIError) => 
                           typeof err === 'string' && err.toLowerCase().includes('authenticity')));
                    
                    if (isCSRFError) {
                        console.log('===== 檢測到真正的 CSRF 錯誤 (422)，嘗試獲取新 token =====')
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
                    } else {
                        console.log('===== 422 錯誤但不是 CSRF 問題，跳過 token 重試 =====')
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
        let serverMessage = ERROR_MESSAGES.GENERAL

        // 從響應中提取錯誤消息
        if (error.response?.data) {
            const responseData = error.response.data as ErrorResponseData

            if (responseData.message) {
                serverMessage = responseData.message
            } else if (responseData.error) {
                serverMessage = responseData.error
            } else if (responseData.errors) {
                // 處理 JSON:API 錯誤格式
                if (Array.isArray(responseData.errors)) {
                    // 檢查是否為 JSON:API 錯誤格式
                    const firstError = responseData.errors[0]
                    if (firstError && typeof firstError === 'object' && 'detail' in firstError) {
                        // JSON:API 錯誤格式：{ errors: [{ detail: "錯誤訊息" }] }
                        serverMessage = (responseData.errors as JSONAPIError[])
                            .map((err) => err.detail || err.title || 'Unknown error')
                            .join(', ')
                    } else {
                        // 傳統錯誤格式：{ errors: ["錯誤訊息"] }
                        serverMessage = (responseData.errors as string[]).join(', ')
                    }
                } else if (typeof responseData.errors === 'object') {
                    serverMessage = Object.values(responseData.errors).flat().join(', ')
                }
            }
        }

        // 根據狀態碼處理不同類型的錯誤
        switch (error.response?.status) {
            case 401:
                this.clearAuthData()
                this.redirectToLogin()
                break
            case 403:
                serverMessage = ERROR_MESSAGES.FORBIDDEN
                break
            case 404:
                serverMessage = ERROR_MESSAGES.NOT_FOUND
                break
            case 500:
                serverMessage = ERROR_MESSAGES.SERVER
                break
            default:
                // 使用服務器返回的錯誤消息
                break
        }

        // 顯示錯誤提示（如果有 toast 功能）
        if (typeof toast !== 'undefined') {
            toast({
                title: '錯誤',
                description: serverMessage,
                variant: 'destructive',
            })
        }

        console.error('API Error:', {
            status: error.response?.status,
            message: serverMessage,
            originalError: error,
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

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<JSONAPIResponse<T>> {
        const response = await this.instance.get<unknown>(url, config)
        return processJSONAPIResponse<T>(response.data) as JSONAPIResponse<T>
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<JSONAPIResponse<T>> {
        const response = await this.instance.post<unknown, AxiosResponse<unknown>, D>(url, data, config)
        return processJSONAPIResponse<T>(response.data) as JSONAPIResponse<T>
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<JSONAPIResponse<T>> {
        const response = await this.instance.put<unknown, AxiosResponse<unknown>, D>(url, data, config)
        return processJSONAPIResponse<T>(response.data) as JSONAPIResponse<T>
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<JSONAPIResponse<T>> {
        const response = await this.instance.patch<unknown, AxiosResponse<unknown>, D>(url, data, config)
        return processJSONAPIResponse<T>(response.data) as JSONAPIResponse<T>
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<JSONAPIResponse<T>> {
        const response = await this.instance.delete<unknown>(url, config)
        return processJSONAPIResponse<T>(response.data) as JSONAPIResponse<T>
    }

    // 新增: 方便的方法來只獲取數據部分（向後兼容）
    public async getData<T>(url: string, config?: AxiosRequestConfig): Promise<T | T[]> {
        const response = await this.get<T>(url, config)
        return extractData(response)
    }

    // 新增: 獲取分頁數據的方法
    public async getPaginated<T>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<{
        data: T[]
        pagination: PaginationMeta | null
    }> {
        const response = await this.get<T>(url, config)
        return {
            data: Array.isArray(response.data) ? response.data : [response.data as T],
            pagination: extractPaginationMeta(response),
        }
    }
}

const apiClient = new ApiClient()
export default apiClient
