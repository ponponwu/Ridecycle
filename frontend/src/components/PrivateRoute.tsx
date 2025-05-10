// src/components/PrivateRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface PrivateRouteProps {
    children: React.ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        // 可以在這裡顯示加載中組件
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        // 重定向到登錄頁面並保存當前位置以便登錄後返回
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}

export default PrivateRoute
