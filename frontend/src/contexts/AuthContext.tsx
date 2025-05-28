// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, ReactNode, useRef, useReducer, useCallback } from 'react'
import { authService } from '@/api'
import { IUser, ILoginRequest, IRegisterRequest, ISocialLoginRequest, IUpdateProfileRequest } from '@/types/auth.types'

// 認證狀態介面
interface AuthState {
    currentUser: IUser | null
    isLoading: boolean
    error: string | null
    lastRefresh: number
    authStatus: 'idle' | 'checking' | 'authenticated' | 'unauthenticated'
}

// 認證動作類型
type AuthAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_USER'; payload: IUser | null }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_AUTH_STATUS'; payload: AuthState['authStatus'] }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET_STATE' }

// 認證狀態 reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'SET_USER':
            return {
                ...state,
                currentUser: action.payload,
                authStatus: action.payload ? 'authenticated' : 'unauthenticated',
                lastRefresh: Date.now(),
                error: null,
            }
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false }
        case 'SET_AUTH_STATUS':
            return { ...state, authStatus: action.payload }
        case 'CLEAR_ERROR':
            return { ...state, error: null }
        case 'RESET_STATE':
            return {
                currentUser: null,
                isLoading: false,
                error: null,
                lastRefresh: 0,
                authStatus: 'unauthenticated',
            }
        default:
            return state
    }
}

// 初始狀態
const initialState: AuthState = {
    currentUser: null,
    isLoading: true,
    error: null,
    lastRefresh: 0,
    authStatus: 'idle',
}

// 智能快取類別
class MemoryCache {
    private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

    set(key: string, data: unknown, ttl = 5 * 60 * 1000) {
        this.cache.set(key, { data, timestamp: Date.now(), ttl })
    }

    get(key: string) {
        const item = this.cache.get(key)
        if (!item) return null

        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key)
            return null
        }

        return item.data
    }

    clear() {
        this.cache.clear()
    }

    has(key: string): boolean {
        const item = this.cache.get(key)
        if (!item) return false

        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key)
            return false
        }

        return true
    }

    getWithFallback<T>(key: string, fallback: () => Promise<T>, ttl?: number): Promise<T> {
        const cached = this.get(key) as T | null
        if (cached) return Promise.resolve(cached)

        return fallback().then((data) => {
            this.set(key, data, ttl)
            return data
        })
    }
}

// 全域快取實例
const userCache = new MemoryCache()

// 認證上下文介面
interface AuthContextType {
    // 狀態
    currentUser: IUser | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    authStatus: AuthState['authStatus']
    lastRefresh: number

    // 方法
    login: (data: ILoginRequest) => Promise<void>
    register: (data: IRegisterRequest) => Promise<void>
    socialLogin: (data: ISocialLoginRequest) => Promise<void>
    logout: () => Promise<void>
    updateProfile: (data: IUpdateProfileRequest) => Promise<void>
    handleOauthSuccess: (user: IUser) => void
    clearError: () => void
    refreshUser: () => Promise<void>
    checkAuthStatus: () => Promise<void>
}

// 創建認證上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 認證提供者 Props 介面
interface AuthProviderProps {
    children: ReactNode
}

// 認證提供者組件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState)
    const initialAuthCheckFlag = useRef(false)

    // 更新用戶快取
    const updateUserCache = useCallback((user: IUser | null) => {
        if (user) {
            userCache.set('currentUser', user)
        } else {
            userCache.clear()
        }
    }, [])

    // 刷新用戶資料的函數
    const refreshUser = useCallback(async () => {
        try {
            dispatch({ type: 'SET_AUTH_STATUS', payload: 'checking' })
            const user = await authService.getCurrentUser()
            dispatch({ type: 'SET_USER', payload: user })
            updateUserCache(user)
        } catch (err) {
            dispatch({ type: 'SET_USER', payload: null })
            updateUserCache(null)
            // 清除任何可能存在的舊 localStorage 資料
            localStorage.removeItem('user')
        }
    }, [updateUserCache])

    // 檢查認證狀態
    const checkAuthStatus = useCallback(async () => {
        if (initialAuthCheckFlag.current) {
            return
        }
        initialAuthCheckFlag.current = true

        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_AUTH_STATUS', payload: 'checking' })

        try {
            // 檢查記憶體快取
            const cachedUser = userCache.get('currentUser') as IUser | null
            if (cachedUser) {
                dispatch({ type: 'SET_USER', payload: cachedUser })
                dispatch({ type: 'SET_LOADING', payload: false })

                // 背景更新用戶資料
                refreshUser().catch(() => {
                    // 背景更新失敗不影響當前狀態
                })
                return
            }

            // 安全做法：直接向伺服器驗證，依賴 HttpOnly cookies 中的 JWT token
            const user = await authService.getCurrentUser()
            dispatch({ type: 'SET_USER', payload: user })
            updateUserCache(user)
        } catch (err) {
            // 如果伺服器驗證失敗（可能是 token 過期或無效），清除狀態
            dispatch({ type: 'SET_USER', payload: null })
            updateUserCache(null)
            // 清除任何可能存在的舊 localStorage 資料
            localStorage.removeItem('user')
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [refreshUser, updateUserCache])

    // 在組件加載時檢查用戶是否已登錄
    useEffect(() => {
        checkAuthStatus()
    }, [checkAuthStatus])

    // 登錄函數
    const login = useCallback(
        async (data: ILoginRequest) => {
            dispatch({ type: 'SET_LOADING', payload: true })
            dispatch({ type: 'CLEAR_ERROR' })
            try {
                const response = await authService.login(data)
                dispatch({ type: 'SET_USER', payload: response.user })
                updateUserCache(response.user)
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message || '登錄失敗' : '發生未知錯誤導致登錄失敗'
                dispatch({ type: 'SET_ERROR', payload: errorMessage })
                throw err
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
        },
        [updateUserCache]
    )

    // 註冊函數
    const register = useCallback(
        async (data: IRegisterRequest) => {
            dispatch({ type: 'SET_LOADING', payload: true })
            dispatch({ type: 'CLEAR_ERROR' })
            try {
                const response = await authService.register(data)
                dispatch({ type: 'SET_USER', payload: response.user })
                updateUserCache(response.user)
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message || '註冊失敗' : '發生未知錯誤導致註冊失敗'
                dispatch({ type: 'SET_ERROR', payload: errorMessage })
                throw err
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
        },
        [updateUserCache]
    )

    // 社交登錄函數
    const socialLogin = useCallback(
        async (data: ISocialLoginRequest) => {
            dispatch({ type: 'SET_LOADING', payload: true })
            dispatch({ type: 'CLEAR_ERROR' })
            try {
                const response = await authService.socialLogin(data)
                dispatch({ type: 'SET_USER', payload: response.user })
                updateUserCache(response.user)
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message || '社交登錄失敗' : '發生未知錯誤導致社交登錄失敗'
                dispatch({ type: 'SET_ERROR', payload: errorMessage })
                throw err
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
        },
        [updateUserCache]
    )

    // 登出函數
    const logout = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'CLEAR_ERROR' })
        try {
            await authService.logout()
            dispatch({ type: 'RESET_STATE' })
            updateUserCache(null)
            localStorage.removeItem('user')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message || '登出失敗' : '發生未知錯誤導致登出失敗'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [updateUserCache])

    // 更新用戶資料函數
    const updateProfile = useCallback(
        async (data: IUpdateProfileRequest) => {
            dispatch({ type: 'SET_LOADING', payload: true })
            dispatch({ type: 'CLEAR_ERROR' })
            try {
                const updatedUser = await authService.updateProfile(data)
                dispatch({ type: 'SET_USER', payload: updatedUser })
                updateUserCache(updatedUser)
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message || '更新資料失敗' : '發生未知錯誤導致更新資料失敗'
                dispatch({ type: 'SET_ERROR', payload: errorMessage })
                throw err
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
        },
        [updateUserCache]
    )

    // 清除錯誤
    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' })
    }, [])

    // OAuth 成功處理
    const handleOauthSuccess = useCallback(
        (user: IUser) => {
            dispatch({ type: 'SET_USER', payload: user })
            updateUserCache(user)
            dispatch({ type: 'SET_LOADING', payload: false })
        },
        [updateUserCache]
    )

    const value: AuthContextType = {
        // 狀態
        currentUser: state.currentUser,
        isAuthenticated: !!state.currentUser,
        isLoading: state.isLoading,
        error: state.error,
        authStatus: state.authStatus,
        lastRefresh: state.lastRefresh,

        // 方法
        login,
        register,
        socialLogin,
        logout,
        updateProfile,
        handleOauthSuccess,
        clearError,
        refreshUser,
        checkAuthStatus,
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
