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

// Create a client
const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <CartProvider>
                        <NotificationProvider>
                            <SearchProvider>
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
                                            path="/messages"
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

                                        {/* 404 頁面 */}
                                        <Route path="*" element={<NotFound />} />
                                    </Routes>
                                </TooltipProvider>
                            </SearchProvider>
                        </NotificationProvider>
                    </CartProvider>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App
