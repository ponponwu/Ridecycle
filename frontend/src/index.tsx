import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import App from './App'
import './styles/globals.css'

// 添加 CSRF token 初始化函數
async function initializeCsrfToken() {
    try {
        console.log('===== 應用啟動時初始化 CSRF token =====')
        const response = await fetch('/api/v1/csrf-token', {
            method: 'GET',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const data = await response.json()
            console.log('===== CSRF token 初始化成功，token:', data.token, '=====')

            // 如果後端未設置 cookie，手動設置
            if (!document.cookie.includes('CSRF-TOKEN=') && data.token) {
                document.cookie = `CSRF-TOKEN=${data.token};path=/;SameSite=None;Secure`
                console.log('===== 手動設置 CSRF token cookie =====')
            }

            // 添加 meta 標籤作為備用
            const meta = document.createElement('meta')
            meta.name = 'csrf-token'
            meta.content = data.token
            document.head.appendChild(meta)
            console.log('===== 添加 CSRF token meta 標籤 =====')

            console.log('===== 初始化後的 cookies:', document.cookie.split(';'), '=====')
        } else {
            console.error(`===== CSRF token 初始化失敗: ${response.status} =====`)
        }
    } catch (error) {
        console.error('===== CSRF token 初始化錯誤:', error, '=====')
    }
}

// 在渲染應用前先初始化 CSRF token
initializeCsrfToken()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <App />
                <Toaster />
            </AuthProvider>
        </Router>
    </React.StrictMode>
)
