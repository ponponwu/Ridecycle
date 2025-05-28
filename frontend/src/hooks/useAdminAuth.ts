import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

/**
 * 管理員認證狀態介面
 */
interface IAdminAuthState {
    isAdmin: boolean
    isLoading: boolean
    isAuthenticated: boolean
}

/**
 * 管理員認證 Hook
 * 檢查用戶是否為管理員，並處理重定向
 *
 * @param redirectOnFail 是否在認證失敗時重定向 (預設: true)
 * @returns 管理員認證狀態
 */
export const useAdminAuth = (redirectOnFail: boolean = true): IAdminAuthState => {
    const { currentUser, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // 等待認證狀態載入完成
        if (authLoading) {
            return
        }

        setIsLoading(false)

        // 檢查用戶是否已登入
        if (!currentUser) {
            if (redirectOnFail) {
                console.warn('Admin access denied: User not authenticated')
                navigate('/login', {
                    replace: true,
                    state: { from: location.pathname, message: '請先登入以存取管理員功能' },
                })
            }
            return
        }

        // 檢查用戶是否為管理員
        const isAdmin = currentUser.admin === true

        if (!isAdmin && redirectOnFail) {
            console.warn('Admin access denied: User is not an admin')
            navigate('/', {
                replace: true,
                state: { message: '您沒有管理員權限' },
            })
        }
    }, [currentUser, authLoading, navigate, redirectOnFail])

    const isAdmin = currentUser ? currentUser.admin === true : false
    const isAuthenticated = !!currentUser

    return {
        isAdmin,
        isLoading: authLoading || isLoading,
        isAuthenticated,
    }
}

export default useAdminAuth
