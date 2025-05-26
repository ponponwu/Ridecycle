// src/App.tsx
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { SearchProvider } from '@/contexts/SearchContext'
import NotificationContainer from '@/components/NotificationContainer'
import PrivateRoute from '@/components/PrivateRoute'
import { useEffect } from 'react'
import apiClient from '@/api/client'
import ErrorBoundary from '@/components/ErrorBoundary'

import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import BicycleDetail from './pages/BicycleDetail'
import NotFound from './pages/NotFound'
import AuthCallback from './pages/AuthCallback'
import UploadBike from './pages/UploadBike'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Messages from './pages/Messages'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import EditBike from './pages/EditBike'

// Create a client
const queryClient = new QueryClient()

// 初始化 CSRF token 的函數
const initializeCsrfToken = async () => {
    try {
        await apiClient.get('csrf_token') // 使用下劃線與後端路由匹配
    } catch (error) {
        console.error('===== 初始化 CSRF token 錯誤:', error, '=====')
    }
}

// 主應用組件，包含路由和 CSRF token 初始化
function AppContent() {
    // 在應用載入時初始化 CSRF token
    useEffect(() => {
        initializeCsrfToken()
    }, [])

    return (
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <NotificationContainer />
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/bicycle/:id" element={<BicycleDetail />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/search" element={<Search />} />

                {/* 需要認證的路由 */}
                <Route
                    path="/upload"
                    element={
                        <PrivateRoute>
                            <UploadBike />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/messages" // General messages overview
                    element={
                        <PrivateRoute>
                            <Messages />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/messages/:conversationId" // Specific conversation view
                    element={
                        <PrivateRoute>
                            <Messages />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/checkout"
                    element={
                        <PrivateRoute>
                            <Checkout />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/order-success"
                    element={
                        <PrivateRoute>
                            <OrderSuccess />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/upload/:bicycleId/edit"
                    element={
                        <PrivateRoute>
                            <EditBike />
                        </PrivateRoute>
                    }
                />

                {/* 404 頁面 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </TooltipProvider>
    )
}

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AuthProvider>
                        <CartProvider>
                            <NotificationProvider>
                                <SearchProvider>
                                    <AppContent />
                                </SearchProvider>
                            </NotificationProvider>
                        </CartProvider>
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}

export default App
