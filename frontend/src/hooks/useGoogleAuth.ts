import { useEffect, useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { modernGoogleAuthService } from '@/services/googleAuth.service'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

interface UseGoogleAuthReturn {
    signInWithGoogle: () => Promise<void>
    signInWithRedirect: () => void
    signOut: () => void
    error: string | null
    isLoading: boolean
    isGoogleReady: boolean
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleReady, setIsGoogleReady] = useState(false)
    const { refreshUser } = useAuth()
    const { t } = useTranslation()

    // 獲取 API 基礎 URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

    // 檢查Google OAuth是否就緒
    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (clientId) {
            setIsGoogleReady(true)
        }
    }, [])

    // 使用 @react-oauth/google 的 useGoogleLogin hook
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true)
            try {
                // 使用 access token 獲取用戶資訊
                console.log(tokenResponse)
                console.log('!!!!!!!!!!!!!!')
                const userInfoResponse = await fetch(
                    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`
                )

                if (userInfoResponse.ok) {
                    const userInfo = await userInfoResponse.json()

                    // 發送到後端
                    const response = await fetch(`${apiBaseUrl}/api/v1/auth/google/callback`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            access_token: tokenResponse.access_token,
                            user_info: userInfo,
                        }),
                        credentials: 'include',
                    })

                    if (response.ok) {
                        const userData = await response.json()
                        toast({
                            title: t('auth.loginSuccess'),
                            description: t('auth.googleLoginSuccessMessage'),
                        })
                        refreshUser()
                        window.location.href = '/'
                    } else {
                        const errorData = await response.json()
                        throw new Error(errorData.message || 'Login failed')
                    }
                } else {
                    throw new Error('Failed to get user info from Google')
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
                setError(errorMessage)
                toast({
                    variant: 'destructive',
                    title: t('auth.googleLoginFailed'),
                    description: errorMessage,
                })
            } finally {
                setIsLoading(false)
            }
        },
        onError: (error) => {
            console.log(error)
            setIsLoading(false)
            const errorMessage = 'Google login failed'
            setError(errorMessage)
            toast({
                variant: 'destructive',
                title: t('auth.googleLoginFailed'),
                description: errorMessage,
            })
        },
        scope: 'openid profile email',
    })

    const signInWithGoogle = async (): Promise<void> => {
        setIsLoading(true)
        setError(null)
        return new Promise<void>((resolve, reject) => {
            try {
                googleLogin()
                // googleLogin是異步的，會通過onSuccess/onError回調處理結果
                resolve()
            } catch (err) {
                setIsLoading(false)
                setError('Failed to initiate Google login')
                reject(err)
            }
        })
    }

    const signInWithRedirect = (): void => {
        // 觸發 Google OAuth 重定向事件，讓組件處理 POST 表單提交
        window.dispatchEvent(new CustomEvent('googleOAuthRedirect'))
    }

    const signOut = (): void => {
        modernGoogleAuthService.signOut()
    }

    return {
        signInWithGoogle,
        signInWithRedirect,
        signOut,
        error,
        isLoading,
        isGoogleReady,
    }
}
