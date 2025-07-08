import React from 'react'
import Navbar from '@/components/layout/Navbar'
import AdminNavbar from '@/components/admin/AdminNavbar'

interface IAdminLayoutProps {
    children: React.ReactNode
}

/**
 * 管理員頁面佈局組件
 * 提供統一的管理員頁面佈局結構，包含側邊欄導航
 */
const AdminLayout: React.FC<IAdminLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                <AdminNavbar />
                <main className="flex-1 ml-0 md:ml-64 container mx-auto px-4 py-8 max-w-7xl">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
