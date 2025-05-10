// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

    // 在組件加載時檢查用戶是否已登錄
    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (localStorage.getItem('auth_token')) {
                    const user = await authService.getCurrentUser()
                    setCurrentUser(user)
                }
            } catch (err: any) {
                console.error('身份驗證檢查失敗:', err)
                setError(err.message || '身份驗證檢查失敗')
                // 清除可能無效的 token
                localStorage.removeItem('auth_token')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    // 登錄函數
    const login = async (data: ILoginRequest) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await authService.login(data)
            setCurrentUser(response.user)
        } catch (err: any) {
            setError(err.message || '登錄失敗')
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
        } catch (err: any) {
            setError(err.message || '註冊失敗')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // 社交媒體登錄函數
    const socialLogin = async (data: ISocialLoginRequest) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await authService.socialLogin(data)
            setCurrentUser(response.user)
        } catch (err: any) {
            setError(err.message || '社交登錄失敗')
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
        } catch (err: any) {
            setError(err.message || '登出失敗')
            throw err
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
        } catch (err: any) {
            setError(err.message || '更新資料失敗')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // 清除錯誤
    const clearError = () => {
        setError(null)
    }

    // 提供的上下文值
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
        clearError,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 使用認證上下文的 Hook
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth 必須在 AuthProvider 中使用')
    }
    return context
}

export default AuthContext
