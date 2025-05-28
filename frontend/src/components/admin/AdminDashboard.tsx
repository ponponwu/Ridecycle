import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bike, Check, Clock, Users, X } from 'lucide-react'
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
        pending_bicycles: 0,
        available_bicycles: 0,
        sold_bicycles: 0,
        draft_bicycles: 0,
        total_bicycles: 0,
        total_users: 0,
        admin_users: 0,
        recent_bicycles: 0,
        recent_users: 0,
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
            <div className="space-y-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        {t('admin.pendingApproval')}
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.pending_bicycles}</div>
                                    <p className="text-xs text-gray-500 mt-1">{t('admin.bicycles')}</p>
                                    <Button
                                        variant="link"
                                        className="px-0 py-1 h-auto text-blue-600"
                                        onClick={() => navigate('/admin/bicycles?status=pending')}
                                    >
                                        {t('admin.viewDetails')}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        {t('admin.approved')}
                                    </CardTitle>
                                    <Check className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.available_bicycles}</div>
                                    <p className="text-xs text-gray-500 mt-1">{t('admin.bicycles')}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        {t('admin.rejected')}
                                    </CardTitle>
                                    <X className="h-4 w-4 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.draft_bicycles}</div>
                                    <p className="text-xs text-gray-500 mt-1">{t('admin.bicycles')}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        {t('admin.totalUsers')}
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_users}</div>
                                    <p className="text-xs text-gray-500 mt-1">{t('admin.users')}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('admin.bicycleManagement')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-500">{t('admin.reviewAndManage')}</p>
                                    <div className="flex items-center space-x-2">
                                        <Bike className="h-5 w-5 text-gray-500" />
                                        <span className="font-medium">
                                            {stats.pending_bicycles} {t('admin.pendingReview')}
                                        </span>
                                    </div>
                                    <Button onClick={() => navigate('/admin/bicycles')}>
                                        {t('admin.manageBicycles')}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('admin.allMessages')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-500">{t('admin.viewAndManageUserMessages')}</p>
                                    <Button onClick={() => navigate('/admin/messages')}>
                                        {t('admin.viewMessages')}
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
