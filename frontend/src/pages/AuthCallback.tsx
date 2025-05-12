import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { IUser } from '@/types/auth.types'

const AuthCallback = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { handleOauthSuccess } = useAuth()
    const processing = useRef(false)

    useEffect(() => {
        if (processing.current) {
            return
        }
        processing.current = true

        const processAuthCallback = async () => {
            try {
                const params = new URLSearchParams(location.search)
                // Token is no longer expected in URL, it's in an HttpOnly cookie
                // const token = params.get('token');
                const userParam = params.get('user')
                const errorParam = params.get('error')

                if (errorParam) {
                    toast({
                        variant: 'destructive',
                        title: '登入失敗',
                        description: decodeURIComponent(errorParam) || '授權過程中發生錯誤',
                    })
                    navigate('/login', { replace: true })
                    return
                }

                // We only need userParam now
                if (userParam) {
                    let user: IUser | null = null
                    try {
                        user = JSON.parse(decodeURIComponent(userParam)) as IUser
                    } catch (e) {
                        console.error('Failed to parse user data from callback:', e)
                        toast({
                            variant: 'destructive',
                            title: '登入失敗',
                            description: '無法解析用戶資料',
                        })
                        navigate('/login', { replace: true })
                        return
                    }

                    if (user) {
                        handleOauthSuccess(user) // Pass only user

                        toast({
                            title: '登入成功',
                            description: `歡迎回來, ${user.fullName || user.username || user.email}!`,
                        })

                        const redirectPath = localStorage.getItem('auth_redirect') || '/'
                        localStorage.removeItem('auth_redirect')
                        navigate(redirectPath, { replace: true })
                    } else {
                        throw new Error('User data missing or invalid in callback.')
                    }
                } else {
                    throw new Error('User data missing in callback parameters.')
                }
            } catch (error) {
                console.error('Authentication callback error:', error)
                toast({
                    variant: 'destructive',
                    title: '登入失敗',
                    description: error instanceof Error ? error.message : '處理授權回調時發生錯誤',
                })
                navigate('/login', { replace: true })
            }
        }

        processAuthCallback()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, location, handleOauthSuccess])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold mb-4 text-gray-800">處理登入中...</h1>
                <p className="text-gray-600">請稍候，我們正在為您設定帳戶。</p>
            </div>
        </div>
    )
}

export default AuthCallback
