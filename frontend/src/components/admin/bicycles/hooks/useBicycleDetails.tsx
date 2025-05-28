import { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.service'
import { BicycleWithOwner } from '@/types/bicycle.types'
import { toast } from '@/hooks/use-toast'

export const useBicycleDetails = (bicycleId: string) => {
    const [bicycle, setBicycle] = useState<BicycleWithOwner | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (bicycleId) {
            fetchBicycleDetails(bicycleId)
        }
    }, [bicycleId])

    const fetchBicycleDetails = async (id: string) => {
        setLoading(true)
        try {
            const data = await adminService.getBicycleById(Number(id))
            setBicycle(data)
        } catch (error) {
            console.error('Error fetching bicycle details:', error)
            toast({
                variant: 'destructive',
                title: '錯誤',
                description: '無法載入自行車詳細資訊',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (): Promise<void> => {
        if (!bicycle) return

        try {
            await adminService.approveBicycle(Number(bicycle.id))

            toast({
                title: '成功',
                description: '自行車已審核通過',
            })

            // Update the UI
            setBicycle({ ...bicycle, status: 'available' })
        } catch (error) {
            console.error('Error approving bicycle:', error)
            toast({
                variant: 'destructive',
                title: '錯誤',
                description: '審核通過失敗，請稍後再試',
            })
            throw error
        }
    }

    const handleReject = async (reason?: string): Promise<void> => {
        if (!bicycle) return

        try {
            await adminService.rejectBicycle(Number(bicycle.id), reason)

            toast({
                title: '成功',
                description: '自行車已被拒絕',
            })

            // Update the UI
            setBicycle({ ...bicycle, status: 'draft' })
        } catch (error) {
            console.error('Error rejecting bicycle:', error)
            toast({
                variant: 'destructive',
                title: '錯誤',
                description: '拒絕操作失敗，請稍後再試',
            })
            throw error
        }
    }

    return {
        bicycle,
        loading,
        handleApprove,
        handleReject,
        refetch: () => fetchBicycleDetails(bicycleId),
    }
}
