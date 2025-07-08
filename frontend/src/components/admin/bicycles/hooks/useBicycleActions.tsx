import { adminService } from '@/services/admin.service'
import { toast } from '@/hooks/use-toast'

/**
 * 共享的自行車操作 hook
 * 提供審核通過、拒絕等基本操作
 */
export const useBicycleActions = () => {
    const approveBicycle = async (id: string): Promise<void> => {
        try {
            await adminService.approveBicycle(Number(id))

            toast({
                title: '成功',
                description: '自行車已審核通過',
            })
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

    const rejectBicycle = async (id: string, reason?: string): Promise<void> => {
        try {
            await adminService.rejectBicycle(Number(id), reason)

            toast({
                title: '成功',
                description: '自行車已被拒絕',
            })
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

    const deleteBicycle = async (id: string): Promise<void> => {
        try {
            await adminService.deleteBicycle(Number(id))

            toast({
                title: 'Success',
                description: 'Bicycle has been deleted',
            })
        } catch (error) {
            console.error('Error deleting bicycle:', error)
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete bicycle',
            })
            throw error
        }
    }

    const archiveBicycle = async (id: string): Promise<void> => {
        try {
            await adminService.archiveBicycle(Number(id))

            toast({
                title: '成功',
                description: '自行車已封存',
            })
        } catch (error) {
            console.error('Error archiving bicycle:', error)
            toast({
                variant: 'destructive',
                title: '錯誤',
                description: '封存失敗，請稍後再試',
            })
            throw error
        }
    }

    return {
        approveBicycle,
        rejectBicycle,
        deleteBicycle,
        archiveBicycle,
    }
}
