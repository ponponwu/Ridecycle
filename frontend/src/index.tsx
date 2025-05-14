import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import App from './App'
import './styles/globals.css'

// 從 App.tsx 中移除，改為只在這裡初始化一次
console.log('===== 應用開始啟動，準備初始化 CSRF token =====')

// 手動確保 App.tsx 中的初始化函數被執行
// 而不是調用本文件中不存在的函數
setTimeout(() => {
    console.log('===== 應用已渲染，檢查是否需要手動請求 CSRF token =====')
    const cookies = document.cookie
    if (!cookies.includes('CSRF-TOKEN=')) {
        console.log('===== 未檢測到 CSRF token，手動發送請求 =====')
        fetch('/api/v1/csrf_token', {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' },
        })
            .then((response) => console.log('===== 手動 CSRF token 請求完成:', response.status, '====='))
            .catch((error) => console.error('===== 手動 CSRF token 請求失敗:', error, '====='))
    } else {
        console.log('===== 已檢測到 CSRF token 存在 =====')
    }
}, 1000)

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
