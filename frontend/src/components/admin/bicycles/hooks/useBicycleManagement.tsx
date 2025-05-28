import { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.service'
import { BicycleWithOwner } from '@/types/bicycle.types'
import { toast } from '@/hooks/use-toast'

export type BicycleStatus = 'pending' | 'available' | 'draft' | 'sold'

export const useBicycleManagement = (initialStatus: BicycleStatus = 'pending') => {
    const [bicycles, setBicycles] = useState<BicycleWithOwner[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<BicycleStatus>(initialStatus)
    const [meta, setMeta] = useState<Record<string, unknown>>({})

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
        try {
            await adminService.approveBicycle(Number(id))

            toast({
                title: '成功',
                description: '自行車已審核通過',
            })

            // Update the UI - remove from current list if it's pending
            if (activeTab === 'pending') {
                setBicycles((prev) => prev.filter((bicycle) => bicycle.id !== id))
            }
        } catch (error) {
            console.error('Error approving bicycle:', error)
            toast({
                variant: 'destructive',
                title: '錯誤',
                description: '審核通過失敗，請稍後再試',
            })
            throw error // Re-throw to allow component to handle loading state
        }
    }

    const handleReject = async (id: string, reason?: string): Promise<void> => {
        try {
            await adminService.rejectBicycle(Number(id), reason)

            toast({
                title: '成功',
                description: '自行車已被拒絕',
            })

            // Update the UI - remove from current list if it's pending
            if (activeTab === 'pending') {
                setBicycles((prev) => prev.filter((bicycle) => bicycle.id !== id))
            }
        } catch (error) {
            console.error('Error rejecting bicycle:', error)
            toast({
                variant: 'destructive',
                title: '錯誤',
                description: '拒絕操作失敗，請稍後再試',
            })
            throw error // Re-throw to allow component to handle loading state
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await adminService.deleteBicycle(Number(id))

            toast({
                title: 'Success',
                description: 'Bicycle has been deleted',
            })

            // Update the UI
            setBicycles((prev) => prev.filter((bicycle) => bicycle.id !== id))
        } catch (error) {
            console.error('Error deleting bicycle:', error)
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete bicycle',
            })
        }
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
        refreshBicycles,
        fetchBicycles,
    }
}
