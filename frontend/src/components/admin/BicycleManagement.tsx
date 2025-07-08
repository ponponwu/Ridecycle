import React from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBicycleManagement, BicycleStatus } from './bicycles/hooks/useBicycleManagement'
import BicycleTabsContent from './bicycles/components/BicycleTabsContent'
import AdminLayout from './AdminLayout'

const BicycleManagement: React.FC = () => {
    const { t } = useTranslation()
    const { bicycles, loading, activeTab, setActiveTab, handleApprove, handleReject, handleArchive } =
        useBicycleManagement()

    const statuses: BicycleStatus[] = ['pending', 'available', 'draft', 'archived']

    return (
        <AdminLayout>
            <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">{t('admin.bicycleManagement')}</h1>
                    <p className="text-gray-500">{t('admin.reviewAndManage')}</p>
                </div>

                <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as BicycleStatus)}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="pending">{t('admin.pendingApproval')}</TabsTrigger>
                        <TabsTrigger value="available">{t('admin.approved')}</TabsTrigger>
                        <TabsTrigger value="draft">{t('admin.rejected')}</TabsTrigger>
                        <TabsTrigger value="archived">封存</TabsTrigger>
                    </TabsList>

                    {statuses.map((status) => (
                        <BicycleTabsContent
                            key={status}
                            status={status}
                            bicycles={status === activeTab ? bicycles : []}
                            loading={status === activeTab && loading}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onArchive={handleArchive}
                        />
                    ))}
                </Tabs>
            </div>
        </AdminLayout>
    )
}

export default BicycleManagement
