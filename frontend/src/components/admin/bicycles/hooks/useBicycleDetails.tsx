import { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.service'
import { BicycleWithOwner } from '@/types/bicycle.types'
import { toast } from '@/hooks/use-toast'
import { useBicycleActions } from './useBicycleActions'

export const useBicycleDetails = (bicycleId: string) => {
    const [bicycle, setBicycle] = useState<BicycleWithOwner | null>(null)
    const [loading, setLoading] = useState(true)
    const { approveBicycle, rejectBicycle } = useBicycleActions()

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

        await approveBicycle(bicycle.id)

        setBicycle({ ...bicycle, status: 'available' })
    }

    const handleReject = async (reason?: string): Promise<void> => {
        if (!bicycle) return

        await rejectBicycle(bicycle.id, reason)

        setBicycle({ ...bicycle, status: 'draft' })
    }

    return {
        bicycle,
        loading,
        handleApprove,
        handleReject,
        refetch: () => fetchBicycleDetails(bicycleId),
    }
}
