import { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.service'
import { BicycleWithOwner } from '@/types/bicycle.types'
import { toast } from '@/hooks/use-toast'
import { useBicycleActions } from './useBicycleActions'

export type BicycleStatus = 'pending' | 'available' | 'draft' | 'sold' | 'archived'

export const useBicycleManagement = (initialStatus: BicycleStatus = 'pending') => {
    const [bicycles, setBicycles] = useState<BicycleWithOwner[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<BicycleStatus>(initialStatus)
    const [meta, setMeta] = useState<Record<string, unknown>>({})
    const { approveBicycle, rejectBicycle, deleteBicycle, archiveBicycle } = useBicycleActions()

    useEffect(() => {
        fetchBicycles(activeTab)
    }, [activeTab])

    const fetchBicycles = async (status: BicycleStatus, page: number = 1, limit: number = 20) => {
        setLoading(true)
        try {
            const result = await adminService.getBicycles({
                status,
                page,
                limit,
            })

            setBicycles(result.bicycles)
            setMeta(result.meta)
        } catch (error) {
            console.error('Error fetching bicycles:', error)
            toast({
                variant: 'destructive',
                title: '錯誤',
                description: '無法載入自行車列表',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string): Promise<void> => {
        await approveBicycle(id)

        if (activeTab === 'pending') {
            setBicycles((prev) => prev.filter((bicycle) => bicycle.id !== id))
        }
    }

    const handleReject = async (id: string, reason?: string): Promise<void> => {
        await rejectBicycle(id, reason)

        if (activeTab === 'pending') {
            setBicycles((prev) => prev.filter((bicycle) => bicycle.id !== id))
        }
    }

    const handleDelete = async (id: string) => {
        await deleteBicycle(id)

        setBicycles((prev) => prev.filter((bicycle) => bicycle.id !== id))
    }

    const handleArchive = async (id: string): Promise<void> => {
        await archiveBicycle(id)

        setBicycles((prev) => prev.filter((bicycle) => bicycle.id !== id))
    }

    const refreshBicycles = () => {
        fetchBicycles(activeTab)
    }

    return {
        bicycles,
        loading,
        activeTab,
        setActiveTab,
        meta,
        handleApprove,
        handleReject,
        handleDelete,
        handleArchive,
        refreshBicycles,
        fetchBicycles,
    }
}
