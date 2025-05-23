// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { authService } from '@/api'
import { IUser, ILoginRequest, IRegisterRequest, ISocialLoginRequest, IUpdateProfileRequest } from '@/types/auth.types'

// 認證上下文介面
interface AuthContextType {
    currentUser: IUser | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (data: ILoginRequest) => Promise<void>
    register: (data: IRegisterRequest) => Promise<void>
    socialLogin: (data: ISocialLoginRequest) => Promise<void>
    logout: () => Promise<void>
    updateProfile: (data: IUpdateProfileRequest) => Promise<void>
    handleOauthSuccess: (user: IUser) => void
    clearError: () => void
}

// 創建認證上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 認證提供者 Props 介面
interface AuthProviderProps {
    children: ReactNode
}

// 認證提供者組件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<IUser | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const initialAuthCheckFlag = useRef(false)

    // 在組件加載時檢查用戶是否已登錄
    useEffect(() => {
        const checkAuthStatus = async () => {
            if (initialAuthCheckFlag.current) {
                return
            }
            initialAuthCheckFlag.current = true

            setIsLoading(true)

            try {
                const user = await authService.getCurrentUser()
                setCurrentUser(user)
                setError(null)
            } catch (err) {
                setCurrentUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuthStatus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 登錄函數
    const login = async (data: ILoginRequest) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await authService.login(data)
            setCurrentUser(response.user)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || '登錄失敗')
            } else {
                setError('發生未知錯誤導致登錄失敗')
            }
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // 註冊函數
    const register = async (data: IRegisterRequest) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await authService.register(data)
            setCurrentUser(response.user)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || '註冊失敗')
            } else {
                setError('發生未知錯誤導致註冊失敗')
            }
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const socialLogin = async (data: ISocialLoginRequest) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await authService.socialLogin(data)
            setCurrentUser(response.user)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || '社交登錄失敗')
            } else {
                setError('發生未知錯誤導致社交登錄失敗')
            }
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // 登出函數
    const logout = async () => {
        setIsLoading(true)
        setError(null)
        try {
            await authService.logout()
            setCurrentUser(null)
            localStorage.removeItem('user')
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || '登出失敗')
            } else {
                setError('發生未知錯誤導致登出失敗')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // 更新用戶資料函數
    const updateProfile = async (data: IUpdateProfileRequest) => {
        setIsLoading(true)
        setError(null)
        try {
            const updatedUser = await authService.updateProfile(data)
            setCurrentUser(updatedUser)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || '更新資料失敗')
            } else {
                setError('發生未知錯誤導致更新資料失敗')
            }
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // 清除錯誤
    const clearError = () => {
        setError(null)
    }

    const handleOauthSuccess = (user: IUser) => {
        setCurrentUser(user)
        setIsLoading(false)
        setError(null)
    }

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        error,
        login,
        register,
        socialLogin,
        logout,
        updateProfile,
        handleOauthSuccess,
        clearError,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth 必須在 AuthProvider 中使用')
    }
    return context
}

export default AuthContext
