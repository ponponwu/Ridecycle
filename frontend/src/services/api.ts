// src/services/api.ts
import axios from 'axios'

// 開發環境和生產環境的基礎 URL
const API_URL =
    process.env.NODE_ENV === 'production' ? 'https://your-production-api.com/api/v1' : 'http://localhost:3000/api/v1'

// 創建 axios 實例
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 請求攔截器，添加認證 token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 響應攔截器，處理常見錯誤
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 處理認證錯誤
        if (error.response && error.response.status === 401) {
            // 清除本地存儲的令牌
            localStorage.removeItem('token')

            // 如果不是登入頁面，重定向到登入頁面
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default api
