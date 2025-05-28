import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AdminLayout from '@/components/admin/AdminLayout'

const AdminTest: React.FC = () => {
    const { currentUser } = useAuth()

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">管理員測試頁面</h1>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">當前用戶資訊</h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(currentUser, null, 2)}
                    </pre>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">管理員檢查</h2>
                    <p>是否為管理員: {currentUser?.admin ? '是' : '否'}</p>
                    <p>用戶 ID: {currentUser?.id}</p>
                    <p>用戶 Email: {currentUser?.email}</p>
                    <p>用戶名稱: {currentUser?.fullName}</p>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminTest
