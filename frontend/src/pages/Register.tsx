import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import AuthForm from '@/components/auth/AuthForm'
import { useAuth } from '@/contexts/AuthContext'

const Register = () => {
    const navigate = useNavigate()
    const { isAuthenticated, isLoading } = useAuth()

    // 如果用戶已經登入，重導向到首頁
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate])

    // 如果正在檢查認證狀態，顯示載入
    if (isLoading) {
        return (
            <MainLayout>
                <div className="bg-gray-50 py-16">
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
            <div className="bg-gray-50 py-16">
                <AuthForm type="register" />
            </div>
        </MainLayout>
    )
}

export default Register
