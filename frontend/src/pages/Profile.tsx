import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import ProfileTabs from '@/components/profile/ProfileTabs'
import { useTranslation } from 'react-i18next'

const Profile = () => {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('personal-info')
    const { t } = useTranslation()

    useEffect(() => {
        // 如果用戶未登錄，重定向到登錄頁面
        if (!currentUser) {
            navigate('/login')
        }
    }, [currentUser, navigate])

    // 提前返回避免未登錄用戶渲染內容
    if (!currentUser) return null

    const handleSignOut = async () => {
        await logout()
        navigate('/')
    }

    return (
        <MainLayout>
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-6">{t('personalCenter')}</h1>

                        <ProfileTabs
                            user={currentUser}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            handleSignOut={handleSignOut}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default Profile
