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
        // 簡單的 GET 請求來初始化 CSRF token
        await fetch('/api/v1/csrf-token', {
            method: 'GET',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
        console.log('CSRF token initialized')
    } catch (error) {
        console.error('Failed to initialize CSRF token:', error)
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
