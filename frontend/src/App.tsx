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
import { GoogleOAuthProvider } from '@/components/providers/GoogleOAuthProvider'
import NotificationContainer from '@/components/NotificationContainer'
import PrivateRoute from '@/components/PrivateRoute'
import { useEffect } from 'react'
import apiClient from '@/api/client'
import ErrorBoundary from '@/components/ErrorBoundary'
import { logOAuthConfigStatus } from '@/utils/oauthConfig'

import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import BicycleDetail from './pages/BicycleDetail'
import SellerProfile from './pages/SellerProfile'
import NotFound from './pages/NotFound'
import AuthCallback from './pages/AuthCallback'
import UploadBike from './pages/UploadBike'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Messages from './pages/Messages'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import OrderList from './pages/OrderList'
import OrderListSimple from './pages/OrderListSimple'
import OrderDetail from './pages/OrderDetail'
import OrderPayment from './pages/OrderPayment'
import EditBike from './pages/EditBike'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import HelpCenter from './pages/HelpCenter'
import AdminDashboard from './components/admin/AdminDashboard'
import BicycleManagement from './components/admin/BicycleManagement'
import BicycleDetailsView from './components/admin/bicycles/BicycleDetailsView'
import UserManagement from './components/admin/UserManagement'
import MessageManagement from './components/admin/MessageManagement'
import FeedbackManagement from './components/admin/FeedbackManagement'
import SystemSettings from './components/admin/SystemSettings'
import AdminRoute from './components/AdminRoute'
import AdminTest from './pages/AdminTest'
import OAuthTest from './pages/OAuthTest'

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
    // 在應用載入時初始化 CSRF token 和檢查 OAuth 配置
    useEffect(() => {
        initializeCsrfToken()
        logOAuthConfigStatus()
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
                <Route path="/seller/:sellerId" element={<SellerProfile />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/oauth-test" element={<OAuthTest />} />
                <Route path="/search" element={<Search />} />
                
                {/* 法律頁面 */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                
                {/* 幫助中心 */}
                <Route path="/help" element={<HelpCenter />} />

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
                    path="/orders"
                    element={
                        <PrivateRoute>
                            <OrderList />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/orders-test"
                    element={
                        <PrivateRoute>
                            <OrderListSimple />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/orders/:orderNumber"
                    element={
                        <PrivateRoute>
                            <OrderDetail />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/orders/:orderNumber/payment"
                    element={
                        <PrivateRoute>
                            <OrderPayment />
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

                {/* 管理員路由 */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/bicycles"
                    element={
                        <AdminRoute>
                            <BicycleManagement />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/bicycles/:id"
                    element={
                        <AdminRoute>
                            <BicycleDetailsView />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <UserManagement />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/messages"
                    element={
                        <AdminRoute>
                            <MessageManagement />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/feedbacks"
                    element={
                        <AdminRoute>
                            <FeedbackManagement />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <AdminRoute>
                            <SystemSettings />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/test"
                    element={
                        <AdminRoute>
                            <AdminTest />
                        </AdminRoute>
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
                <GoogleOAuthProvider>
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
                </GoogleOAuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}

export default App
