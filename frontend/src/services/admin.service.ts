import apiClient from '@/api/client'
import { IBicycle, BicycleWithOwner } from '@/types/bicycle.types'
import { IOrder } from '@/types/order.types'

/**
 * 管理員儀表板統計資料介面
 */
export interface IAdminStats {
    pending_bicycles: number
    available_bicycles: number
    sold_bicycles: number
    draft_bicycles: number
    total_bicycles: number
    total_users: number
    admin_users: number
    recent_bicycles: number
    recent_users: number
}

/**
 * 管理員最近活動資料介面
 */
export interface IAdminRecentActivity {
    recent_bicycles: BicycleWithOwner[]
    recent_users: Array<{
        id: number
        name: string
        email: string
        admin: boolean
        created_at: string
        bicycles_count: number
    }>
}

/**
 * 管理員訂單統計資料介面
 */
export interface IAdminOrderStats {
    total_orders: number
    pending_payment: number
    awaiting_confirmation: number
    paid_orders: number
    failed_payments: number
    refunded_orders: number
    recent_orders: number
}

/**
 * 管理員用訂單介面（擴展基本訂單資料）
 */
export interface IAdminOrder extends IOrder {
    buyer: {
        id: number
        name: string
        email: string
        full_name?: string
    }
    seller: {
        id: number
        name: string
        email: string
        full_name?: string
    }
    bicycle: {
        id: number
        title: string
        brand?: string
        model?: string
        price: number
        mainPhotoUrl?: string
    }
    paymentProofInfo?: {
        hasProof: boolean
        status: 'none' | 'pending' | 'approved' | 'rejected'
        filename?: string
        uploadedAt?: string
        fileSize?: number
        contentType?: string
        proofUrl?: string
        reviewedAt?: string
        reviewedBy?: string
        reviewNotes?: string
    }
}

/**
 * JSON:API 回應格式介面
 */
interface IJSONAPIResponse<T> {
    data: T
    meta?: Record<string, unknown>
    errors?: Array<{
        status: string
        title: string
        detail: string
    }>
}

/**
 * JSON:API 資源格式介面
 */
interface IJSONAPIResource<T> {
    type: string
    id: string
    attributes: T
}

/**
 * 分頁回應格式介面
 */
interface IPaginatedResponse<T> {
    data: T[]
    meta: {
        total_count: number
        current_page: number
        per_page: number
        total_pages: number
        status_counts?: Record<string, number>
    }
}

/**
 * 管理員服務類別
 * 處理所有管理員相關的 API 請求
 */
class AdminService {
    private readonly baseUrl = 'admin'

    /**
     * 獲取儀表板統計資料
     * @returns Promise<IAdminStats> 統計資料
     */
    async getDashboardStats(): Promise<IAdminStats> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/dashboard/stats`)
            // API 客戶端已經處理了 JSON:API 格式，直接使用 data
            return response.data as IAdminStats
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
            throw error
        }
    }

    /**
     * 獲取最近活動資料
     * @returns Promise<IAdminRecentActivity> 最近活動資料
     */
    async getRecentActivity(): Promise<IAdminRecentActivity> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/dashboard/recent_activity`)
            // API 客戶端已經處理了 JSON:API 格式，直接使用 data
            return response.data as IAdminRecentActivity
        } catch (error) {
            console.error('Error fetching recent activity:', error)
            throw error
        }
    }

    /**
     * 獲取自行車列表（管理員視圖）
     * @param params 查詢參數
     * @returns Promise<{ bicycles: IBicycle[], meta: Record<string, unknown> }> 自行車列表和分頁資訊
     */
    async getBicycles(
        params: {
            status?: string
            search?: string
            page?: number
            limit?: number
        } = {}
    ): Promise<{ bicycles: BicycleWithOwner[]; meta: Record<string, unknown> }> {
        try {
            const queryParams = new URLSearchParams()

            if (params.status) queryParams.append('status', params.status)
            if (params.search) queryParams.append('search', params.search)
            if (params.page) queryParams.append('page', params.page.toString())
            if (params.limit) queryParams.append('limit', params.limit.toString())

            const response = await apiClient.get(`${this.baseUrl}/bicycles?${queryParams.toString()}`)

            // API 客戶端已經處理了 JSON:API 格式
            // 後端使用統一的 render_jsonapi_collection 方法
            const bicycles = Array.isArray(response.data) ? (response.data as BicycleWithOwner[]) : []
            const meta = response.meta || {}

            return {
                bicycles,
                meta,
            }
        } catch (error) {
            console.error('Error fetching admin bicycles:', error)
            throw error
        }
    }

    /**
     * 獲取單一自行車詳細資訊（管理員視圖）
     * @param id 自行車 ID
     * @returns Promise<IBicycle> 自行車詳細資訊
     */
    async getBicycleById(id: number): Promise<BicycleWithOwner> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/bicycles/${id}`)
            // API 客戶端已經處理了 JSON:API 格式，直接使用 data
            return response.data as BicycleWithOwner
        } catch (error) {
            console.error('Error fetching bicycle details:', error)
            throw error
        }
    }

    /**
     * 審核通過自行車
     * @param id 自行車 ID
     * @returns Promise<Record<string, unknown>> 審核結果
     */
    async approveBicycle(id: number): Promise<Record<string, unknown>> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/bicycles/${id}/approve`)
            return response.data as Record<string, unknown>
        } catch (error) {
            console.error('Error approving bicycle:', error)
            throw error
        }
    }

    /**
     * 拒絕自行車
     * @param id 自行車 ID
     * @param reason 拒絕原因
     * @returns Promise<Record<string, unknown>> 拒絕結果
     */
    async rejectBicycle(id: number, reason?: string): Promise<Record<string, unknown>> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/bicycles/${id}/reject`, { reason })
            return response.data as Record<string, unknown>
        } catch (error) {
            console.error('Error rejecting bicycle:', error)
            throw error
        }
    }

    /**
     * 更新自行車資訊（管理員權限）
     * @param id 自行車 ID
     * @param data 更新資料
     * @returns Promise<IBicycle> 更新後的自行車資料
     */
    async updateBicycle(id: number, data: Partial<BicycleWithOwner>): Promise<BicycleWithOwner> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/bicycles/${id}`, { bicycle: data })
            // API 客戶端已經處理了 JSON:API 格式，直接使用 data
            return response.data as BicycleWithOwner
        } catch (error) {
            console.error('Error updating bicycle:', error)
            throw error
        }
    }

    /**
     * 刪除自行車（管理員權限）
     * @param id 自行車 ID
     * @returns Promise<void>
     */
    async deleteBicycle(id: number): Promise<void> {
        try {
            await apiClient.delete(`${this.baseUrl}/bicycles/${id}`)
            // 204 No Content 回應不需要處理資料
        } catch (error) {
            console.error('Error deleting bicycle:', error)
            throw error
        }
    }

    // ==================== 訂單管理方法 ====================

    /**
     * 獲取訂單統計資料（管理員視圖）
     * @returns Promise<IAdminOrderStats> 訂單統計資料
     */
    async getOrderStats(): Promise<IAdminOrderStats> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/orders/stats`)
            return response.data as IAdminOrderStats
        } catch (error) {
            console.error('Error fetching order stats:', error)
            throw error
        }
    }

    /**
     * 獲取訂單列表（管理員視圖）
     * @param params 查詢參數
     * @returns Promise<{ orders: IAdminOrder[], meta: Record<string, unknown> }> 訂單列表和分頁資訊
     */
    async getOrders(
        params: {
            paymentStatus?: string
            status?: string
            search?: string
            page?: number
            limit?: number
            sortBy?: string
            sortOrder?: 'asc' | 'desc'
        } = {}
    ): Promise<{ orders: IAdminOrder[]; meta: Record<string, unknown> }> {
        try {
            const queryParams = new URLSearchParams()

            if (params.paymentStatus) queryParams.append('payment_status', params.paymentStatus)
            if (params.status) queryParams.append('status', params.status)
            if (params.search) queryParams.append('search', params.search)
            if (params.page) queryParams.append('page', params.page.toString())
            if (params.limit) queryParams.append('limit', params.limit.toString())
            if (params.sortBy) queryParams.append('sort_by', params.sortBy)
            if (params.sortOrder) queryParams.append('sort_order', params.sortOrder)

            const response = await apiClient.get(`${this.baseUrl}/orders?${queryParams.toString()}`)

            const orders = Array.isArray(response.data) ? (response.data as IAdminOrder[]) : []
            const meta = response.meta || {}

            return {
                orders,
                meta,
            }
        } catch (error) {
            console.error('Error fetching admin orders:', error)
            throw error
        }
    }

    /**
     * 獲取單一訂單詳細資訊（管理員視圖）
     * @param id 訂單 ID
     * @returns Promise<IAdminOrder> 訂單詳細資訊
     */
    async getOrderById(id: string): Promise<IAdminOrder> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/orders/${id}`)
            return response.data as IAdminOrder
        } catch (error) {
            console.error('Error fetching order details:', error)
            throw error
        }
    }

    /**
     * 審核通過付款證明
     * @param orderId 訂單 ID
     * @param notes 審核備註
     * @returns Promise<{ success: boolean; message: string }> 審核結果
     */
    async approvePaymentProof(
        orderId: string,
        notes?: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/orders/${orderId}/approve_payment`, {
                notes,
            })
            return response.data as { success: boolean; message: string }
        } catch (error) {
            console.error('Error approving payment proof:', error)
            throw error
        }
    }

    /**
     * 拒絕付款證明
     * @param orderId 訂單 ID
     * @param reason 拒絕原因
     * @param notes 審核備註
     * @returns Promise<{ success: boolean; message: string }> 拒絕結果
     */
    async rejectPaymentProof(
        orderId: string,
        reason: string,
        notes?: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/orders/${orderId}/reject_payment`, {
                reason,
                notes,
            })
            return response.data as { success: boolean; message: string }
        } catch (error) {
            console.error('Error rejecting payment proof:', error)
            throw error
        }
    }

    /**
     * 獲取付款證明圖片URL（管理員視圖）
     * @param orderId 訂單 ID
     * @returns Promise<{ proofUrl: string }> 付款證明圖片URL
     */
    async getPaymentProofUrl(orderId: string): Promise<{ proofUrl: string }> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/orders/${orderId}/payment_proof`)
            return response.data as { proofUrl: string }
        } catch (error) {
            console.error('Error fetching payment proof URL:', error)
            throw error
        }
    }

    /**
     * 更新訂單狀態（管理員權限）
     * @param orderId 訂單 ID
     * @param status 新狀態
     * @param notes 更新備註
     * @returns Promise<IAdminOrder> 更新後的訂單資料
     */
    async updateOrderStatus(
        orderId: string,
        status: string,
        notes?: string
    ): Promise<IAdminOrder> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/orders/${orderId}/status`, {
                status,
                notes,
            })
            return response.data as IAdminOrder
        } catch (error) {
            console.error('Error updating order status:', error)
            throw error
        }
    }

    /**
     * 批量操作訂單
     * @param orderIds 訂單ID列表
     * @param action 操作類型
     * @param data 操作參數
     * @returns Promise<{ success: boolean; message: string; results: Record<string, unknown>[] }> 批量操作結果
     */
    async bulkUpdateOrders(
        orderIds: string[],
        action: 'approve_payment' | 'reject_payment' | 'update_status',
        data: Record<string, unknown>
    ): Promise<{ success: boolean; message: string; results: Record<string, unknown>[] }> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/orders/bulk_update`, {
                order_ids: orderIds,
                action,
                data,
            })
            return response.data as { success: boolean; message: string; results: Record<string, unknown>[] }
        } catch (error) {
            console.error('Error bulk updating orders:', error)
            throw error
        }
    }
}

// 匯出單例實例
export const adminService = new AdminService()
export default adminService
