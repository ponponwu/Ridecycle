import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface IAdminRouteProps {
    children: React.ReactNode
}

/**
 * 管理員路由保護組件
 * 只允許管理員用戶訪問受保護的路由
 */
const AdminRoute: React.FC<IAdminRouteProps> = ({ children }) => {
    const location = useLocation()
    const { isAdmin, isLoading, isAuthenticated } = useAdminAuth(false)

    // 顯示載入狀態
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    // 如果用戶未登入，重定向到登入頁面
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{
                    from: location.pathname,
                    message: '請先登入以存取管理員功能',
                }}
                replace
            />
        )
    }

    // 如果用戶不是管理員，重定向到首頁
    if (!isAdmin) {
        return (
            <Navigate
                to="/"
                state={{
                    message: '您沒有管理員權限',
                }}
                replace
            />
        )
    }

    // 如果是管理員，渲染子組件
    return <>{children}</>
}

export default AdminRoute
