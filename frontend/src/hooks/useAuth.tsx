import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'
import { toast } from '@/hooks/use-toast'

type User = {
    id: string
    email: string
    name: string
    avatar_url?: string
}

type AuthContextType = {
    user: User | null
    isLoading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, name: string) => Promise<void>
    signInWithGoogle: () => Promise<void>
    signInWithFacebook: () => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    // 檢查用戶是否已登入
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const response = await api.get('/me')
                    setUser(response.data.user)
                } catch (error) {
                    localStorage.removeItem('token')
                }
            }
            setIsLoading(false)
        }

        checkAuth()
    }, [])

    const signIn = async (email: string, password: string) => {
        try {
            const response = await api.post('/login', { email, password })
            const { user, token } = response.data
            localStorage.setItem('token', token)
            setUser(user)

            toast({
                title: '登入成功',
                description: '歡迎回來！',
            })
            navigate('/')

            // if (error) {
            //   throw error;
            // }

            // toast({
            //   title: "Welcome back!",
            //   description: "You have successfully signed in.",
            // });
        } catch (error: any) {
            console.error('Login error:', error)
            toast({
                variant: 'destructive',
                title: '登入失敗',
                description: error.response?.data?.error || '登入時發生錯誤',
            })
            throw error
        }
    }

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const response = await api.post('/register', { email, password, name })
            localStorage.setItem('token', response.data.token)
            setUser(response.data.user)

            toast({
                title: '註冊成功',
                description: '歡迎加入！',
            })

            navigate('/')
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: '註冊失敗',
                description: error.response?.data?.errors?.join(', ') || '註冊時發生錯誤',
            })
            throw error
        }
    }

    const signInWithGoogle = async () => {
        try {
            // const { error } = await supabase.auth.signInWithOAuth({
            //     provider: 'google',
            //     options: {
            //         redirectTo: `${window.location.origin}/auth/callback`,
            //     },
            // })

            // if (error) {
            //     throw error
            // }
            window.location.href = `${BASE_URL}/auth/google`
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Google sign in failed',
                description: error.message || 'An error occurred during Google sign in',
            })
            throw error
        }
    }

    const signInWithFacebook = async () => {
        try {
            // const { error } = await supabase.auth.signInWithOAuth({
            //     provider: 'facebook',
            //     options: {
            //         redirectTo: `${window.location.origin}/auth/callback`,
            //     },
            // })

            // if (error) {
            //     throw error
            // }
            window.location.href = `${BASE_URL}/auth/google`
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Facebook sign in failed',
                description: error.message || 'An error occurred during Facebook sign in',
            })
            throw error
        }
    }

    const signOut = async () => {
        try {
            await api.post('/logout')
            localStorage.removeItem('token')
            setUser(null)

            toast({
                title: '已登出',
                description: '您已成功登出。',
            })

            navigate('/login')
        } catch (error: any) {
            localStorage.removeItem('token')
            setUser(null)
            navigate('/login')
            toast({
                variant: 'destructive',
                title: 'Sign out failed',
                description: error.message || 'An error occurred during sign out',
            })
        }
    }

    const value = {
        user,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
