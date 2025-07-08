import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, AlertTriangle, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { adminService, IAdminStats } from '@/services/admin.service'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import AdminLayout from './AdminLayout'

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { isAdmin, isLoading: authLoading } = useAdminAuth()

    const [stats, setStats] = useState<IAdminStats>({
        pendingBicycles: 0,
        availableBicycles: 0,
        soldBicycles: 0,
        draftBicycles: 0,
        totalBicycles: 0,
        totalUsers: 0,
        adminUsers: 0,
        recentBicycles: 0,
        recentUsers: 0,
    })

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && isAdmin) {
            fetchStats()
        }
    }, [authLoading, isAdmin])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const statsData = await adminService.getDashboardStats()
            setStats(statsData)
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <AdminLayout>
            <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">{t('admin.adminDashboard')}</h1>
                    <p className="text-gray-500">{t('admin.adminAccess')}</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <>
                        {/* Alert Cards for Pending Items */}
                        {stats.pendingBicycles > 0 && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-yellow-800">待審核項目</h3>
                                        <p className="text-sm text-yellow-600">
                                            您有 {stats.pendingBicycles} 個自行車需要審核
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                                        onClick={() => navigate('/admin/bicycles')}
                                    >
                                        立即審核
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Total Users Card - Main Focus */}
                            <Card
                                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-blue-100 hover:border-blue-200"
                                onClick={() => navigate('/admin/users')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        {t('admin.totalUsers')}
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                                    <p className="text-xs text-gray-500 mt-1">{t('admin.users')}</p>
                                    <Button variant="link" className="px-0 py-1 h-auto text-blue-600">
                                        進入用戶管理
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Bicycle Management Quick Access */}
                            <Card
                                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => navigate('/admin/bicycles')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-gray-500">自行車管理</CardTitle>
                                    <Bell className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{stats.totalBicycles}</div>
                                    <p className="text-xs text-gray-500 mt-1">總自行車數</p>
                                    {stats.pendingBicycles > 0 && (
                                        <div className="flex items-center mt-2">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                                            <span className="text-xs text-yellow-600">
                                                {stats.pendingBicycles} 待審核
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Messages Quick Access */}
                            <Card
                                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => navigate('/admin/messages')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-gray-500">訊息管理</CardTitle>
                                    <Bell className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-600">✓</div>
                                    <p className="text-xs text-gray-500 mt-1">用戶對話監控</p>
                                    <Button variant="link" className="px-0 py-1 h-auto text-purple-600">
                                        查看訊息
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                    </>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard
