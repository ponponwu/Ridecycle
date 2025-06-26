import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import AuthForm from '@/components/auth/AuthForm'
import { Button } from '@/components/ui/button' // Import Button
import { FaGoogle, FaFacebook } from 'react-icons/fa' // Import icons
import { useAuth } from '@/contexts/AuthContext'

const Login = () => {
    const navigate = useNavigate()
    const { isAuthenticated, isLoading } = useAuth()

    // 如果用戶已經登入，重導向到首頁
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate])
    const handleGoogleLogin = () => {
        // Redirect to backend OmniAuth route for Google
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/google_oauth2`
    }

    const handleFacebookLogin = () => {
        // Redirect to backend OmniAuth route for Facebook
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/facebook`
    }

    // 如果正在檢查認證狀態，顯示載入
    if (isLoading) {
        return (
            <MainLayout>
                <div className="bg-gray-50 py-12 md:py-16">
                    <div className="container mx-auto px-4 max-w-md">
                        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-auto">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">檢查登入狀態...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="bg-gray-50 py-12 md:py-16">
                <div className="container mx-auto px-4 max-w-md">
                    <AuthForm type="login" />

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            {' '}
                            {/* Changed to grid-cols-1 for better stacking on mobile */}
                            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                                <FaGoogle className="mr-2 h-5 w-5" />
                                Sign in with Google
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                onClick={handleFacebookLogin}
                            >
                                <FaFacebook className="mr-2 h-5 w-5" />
                                Sign in with Facebook
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default Login
