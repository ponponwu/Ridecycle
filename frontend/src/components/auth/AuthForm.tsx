import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { ILoginRequest, IRegisterRequest } from '@/types/auth.types'

type AuthFormProps = {
    type: 'login' | 'register'
}

const AuthForm = ({ type }: AuthFormProps) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const navigate = useNavigate()

    const { login, register, isLoading, error, clearError } = useAuth()

    const isLogin = type === 'login'
    const title = isLogin ? '登入' : '創建帳號'
    const buttonText = isLogin ? '登入' : '創建帳號'
    const altText = isLogin ? '還沒有帳號？註冊' : '已經有帳號？登入'
    const altLink = isLogin ? '/register' : '/login'

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        clearError()

        try {
            if (isLogin) {
                const loginData: ILoginRequest = {
                    email,
                    password,
                    rememberMe: true,
                }
                await login(loginData)
                toast({
                    title: '登入成功',
                    description: '歡迎回來！',
                })
                navigate('/')
            } else {
                const registerData: IRegisterRequest = {
                    email,
                    password,
                    passwordConfirmation: password,
                    fullName: name,
                    agreement: true,
                }
                await register(registerData)
                toast({
                    title: '註冊成功',
                    description: '您的帳號已成功創建！',
                })
                navigate('/')
            }
        } catch (err) {
            console.error('認證錯誤:', err)
            toast({
                variant: 'destructive',
                title: isLogin ? '登入失敗' : '註冊失敗',
                description: error || '發生錯誤，請稍後再試',
            })
        }
    }

    // 處理 Google 登入
    const handleGoogleSignIn = async () => {
        try {
            // 重定向到 Google 授權頁面
            // 這裡應該調用後端 API 來獲取授權 URL
            window.location.href = '/api/auth/google'

            // 注意：這裡不需要導航和顯示成功訊息，因為頁面會被重定向
        } catch (err) {
            console.error('Google 登入錯誤:', err)
            toast({
                variant: 'destructive',
                title: 'Google 登入失敗',
                description: '無法啟動 Google 登入流程，請稍後再試',
            })
        }
    }

    // 處理 Facebook 登入
    const handleFacebookSignIn = async () => {
        try {
            // 重定向到 Facebook 授權頁面
            // 這裡應該調用後端 API 來獲取授權 URL
            window.location.href = '/api/auth/facebook'

            // 注意：這裡不需要導航和顯示成功訊息，因為頁面會被重定向
        } catch (err) {
            console.error('Facebook 登入錯誤:', err)
            toast({
                variant: 'destructive',
                title: 'Facebook 登入失敗',
                description: '無法啟動 Facebook 登入流程，請稍後再試',
            })
        }
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-gray-600 mt-2">{isLogin ? '歡迎回到 Ride Cycle' : '加入 Ride Cycle 社區'}</p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-4 mb-6">
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.255H17.92C17.665 15.63 16.89 16.795 15.725 17.525V20.335H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23C14.97 23 17.46 22 19.28 20.335L15.725 17.525C14.74 18.165 13.48 18.55 12 18.55C9.13501 18.55 6.70001 16.64 5.81501 14H2.17501V16.895C3.98001 20.555 7.70001 23 12 23Z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.81496 14C5.59996 13.35 5.47496 12.66 5.47496 11.95C5.47496 11.24 5.59996 10.55 5.81496 9.9V7.005H2.17496C1.42996 8.785 0.999961 10.805 0.999961 12.95C0.999961 15.095 1.42996 17.115 2.17496 18.895L5.81496 16V14Z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.39998C13.62 5.39998 15.06 5.97498 16.21 7.07998L19.36 3.92998C17.455 2.14998 14.965 0.999976 12 0.999976C7.70001 0.999976 3.98001 3.44498 2.17501 7.10498L5.81501 9.99998C6.70001 7.35998 9.13501 5.39998 12 5.39998Z"
                            fill="#EA4335"
                        />
                    </svg>
                    使用 Google 帳號登入
                </button>

                <button
                    type="button"
                    onClick={handleFacebookSignIn}
                    className="w-full flex items-center justify-center gap-3 bg-[#1877F2] rounded-lg px-4 py-3 text-white font-medium hover:bg-[#166FE5] transition-colors"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M24 12.0733C24 5.40546 18.6274 0 12 0C5.37262 0 0 5.40546 0 12.0733C0 18.0995 4.38823 23.0943 10.125 24V15.5633H7.07694V12.0733H10.125V9.41343C10.125 6.38755 11.9165 4.71615 14.6576 4.71615C15.9705 4.71615 17.3438 4.95195 17.3438 4.95195V7.92313H15.8306C14.3399 7.92313 13.875 8.85384 13.875 9.80855V12.0733H17.2031L16.6711 15.5633H13.875V24C19.6118 23.0943 24 18.0995 24 12.0733Z" />
                    </svg>
                    使用 Facebook 帳號登入
                </button>
            </div>

            {/* Divider */}
            <div className="flex items-center mb-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">或</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            姓名
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                            placeholder="請輸入您的姓名"
                            required={!isLogin}
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        電子郵件
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                        placeholder="請輸入您的電子郵件"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        密碼
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                        placeholder="請輸入您的密碼"
                        required
                    />
                </div>

                {isLogin && (
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-marketplace-blue hover:underline">
                            忘記密碼？
                        </Link>
                    </div>
                )}

                <Button type="submit" className="w-full bg-marketplace-blue hover:bg-blue-600" disabled={isLoading}>
                    {isLoading ? '處理中...' : buttonText}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    {isLogin ? '還沒有帳號？' : '已經有帳號？'}
                    <Link to={altLink} className="text-marketplace-blue hover:underline font-medium">
                        {isLogin ? '註冊' : '登入'}
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default AuthForm
