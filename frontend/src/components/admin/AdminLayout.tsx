import React from 'react'
import Navbar from '@/components/layout/Navbar'

interface IAdminLayoutProps {
    children: React.ReactNode
}

/**
 * 管理員頁面佈局組件
 * 提供統一的管理員頁面佈局結構
 */
const AdminLayout: React.FC<IAdminLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
        </div>
    )
}

export default AdminLayout
