import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// 載入組件
const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">載入中...</span>
    </div>
)

// 認證狀態檢查組件
const AuthStatusChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading, authStatus } = useAuth()
    const location = useLocation()

    // 正在檢查認證狀態
    if (isLoading || authStatus === 'checking') {
        return <LoadingSpinner />
    }

    // 未認證，重定向到登入頁面
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // 已認證，渲染子組件
    return <>{children}</>
}

// 認證中間件 HOC
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
    const AuthenticatedComponent = (props: P) => {
        return (
            <AuthStatusChecker>
                <Component {...props} />
            </AuthStatusChecker>
        )
    }

    // 設置顯示名稱以便於除錯
    AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`

    return AuthenticatedComponent
}

// 可選認證中間件 - 不強制要求認證，但會提供認證狀態
export const withOptionalAuth = <P extends object>(Component: React.ComponentType<P>) => {
    const OptionallyAuthenticatedComponent = (props: P) => {
        const { isLoading, authStatus } = useAuth()

        // 如果正在檢查認證狀態，顯示載入畫面
        if (isLoading || authStatus === 'checking') {
            return <LoadingSpinner />
        }

        // 無論是否認證都渲染組件
        return <Component {...props} />
    }

    OptionallyAuthenticatedComponent.displayName = `withOptionalAuth(${Component.displayName || Component.name})`

    return OptionallyAuthenticatedComponent
}

// 管理員認證中間件
export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) => {
    const AdminAuthenticatedComponent = (props: P) => {
        const { currentUser, isAuthenticated, isLoading, authStatus } = useAuth()
        const location = useLocation()

        // 正在檢查認證狀態
        if (isLoading || authStatus === 'checking') {
            return <LoadingSpinner />
        }

        // 未認證，重定向到登入頁面
        if (!isAuthenticated) {
            return <Navigate to="/login" state={{ from: location }} replace />
        }

        // 不是管理員，重定向到首頁
        if (!currentUser?.admin) {
            return <Navigate to="/" replace />
        }

        // 已認證且是管理員，渲染子組件
        return <Component {...props} />
    }

    AdminAuthenticatedComponent.displayName = `withAdminAuth(${Component.displayName || Component.name})`

    return AdminAuthenticatedComponent
}

// 訪客專用中間件 - 只允許未認證用戶訪問（如登入、註冊頁面）
export const withGuestOnly = <P extends object>(Component: React.ComponentType<P>) => {
    const GuestOnlyComponent = (props: P) => {
        const { isAuthenticated, isLoading, authStatus } = useAuth()
        const location = useLocation()

        // 正在檢查認證狀態
        if (isLoading || authStatus === 'checking') {
            return <LoadingSpinner />
        }

        // 已認證，重定向到原來要去的頁面或首頁
        if (isAuthenticated) {
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
            return <Navigate to={from} replace />
        }

        // 未認證，渲染子組件
        return <Component {...props} />
    }

    GuestOnlyComponent.displayName = `withGuestOnly(${Component.displayName || Component.name})`

    return GuestOnlyComponent
}

export default withAuth
