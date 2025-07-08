import apiClient, { JSONAPIResponse } from '@/api/client'
import { IBicycle, BicycleWithOwner } from '@/types/bicycle.types'
import { IOrder } from '@/types/order.types'

/**
 * 管理員儀表板統計資料介面
 */
export interface IAdminStats {
    pendingBicycles: number
    availableBicycles: number
    soldBicycles: number
    draftBicycles: number
    totalBicycles: number
    totalUsers: number
    adminUsers: number
    recentBicycles: number
    recentUsers: number
}

/**
 * 管理員最近活動資料介面
 */
export interface IAdminRecentActivity {
    recentBicycles: BicycleWithOwner[]
    recentUsers: Array<{
        id: number
        name: string
        email: string
        admin: boolean
        createdAt: string
        bicyclesCount: number
    }>
}

/**
 * 管理員訂單統計資料介面
 */
export interface IAdminOrderStats {
    totalOrders: number
    pendingPayment: number
    awaitingConfirmation: number
    paidOrders: number
    failedPayments: number
    refundedOrders: number
    recentOrders: number
}

/**
 * 銀行帳戶資訊介面
 */
export interface BankAccountInfo {
    bankName: string
    bankCode: string
    accountNumber: string
    accountName: string
    branch: string
}

/**
 * 網站配置介面
 */
export interface SiteConfiguration {
    siteName: string
    contactEmail: string
    bankName: string
    bankCode: string
    accountNumber: string
    accountName: string
    bankBranch: string
    enableRegistration: boolean
    requireVerification: boolean
    bicycleApprovalRequired: boolean
}

/**
 * 管理員用戶資料介面
 */
export interface IAdminUser {
    id: number
    fullName: string
    name: string
    email: string
    avatarUrl?: string
    admin: boolean
    createdAt: string
    updatedAt: string
    bicyclesCount: number
    messagesCount: number
    isBlacklisted: boolean
    phoneVerified: boolean
    isSuspicious: boolean
}

/**
 * 訊息資料介面
 */
export interface IAdminMessage {
    id: number
    content: string
    senderId: number
    receiverId: number
    bicycleId: number
    createdAt: string
    updatedAt: string
    messageType?: string
    offerAmount?: number
    offerStatus?: string
    senderName: string
    recipientName: string
}

/**
 * API 回應介面
 */
interface IApiResponse {
    message?: string
}

/**
 * 管理員用訂單介面（擴展基本訂單資料）
 */
export interface IAdminOrder extends Omit<IOrder, 'buyer' | 'seller'> {
    buyer: {
        id: number
        name: string
        email: string
        fullName?: string
    }
    seller: {
        id: number
        name: string
        email: string
        fullName?: string
    }
    bicycle: {
        id: string
        title: string
        brand?: string
        model?: string
        price: number
        mainPhotoUrl?: string
        status: string
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
            // API 客戶端已經處理了 JSON:API 格式和 camelCase 轉換
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
            // API 客戶端已經處理了 JSON:API 格式和 camelCase 轉換
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

            // API 客戶端已經處理了 JSON:API 格式和 camelCase 轉換
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

    /**
     * 封存自行車
     * @param id 自行車 ID
     * @returns Promise<Record<string, unknown>> 封存結果
     */
    async archiveBicycle(id: number): Promise<Record<string, unknown>> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/bicycles/${id}/archive`)
            return response.data as Record<string, unknown>
        } catch (error) {
            console.error('Error archiving bicycle:', error)
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
    async approvePaymentProof(orderId: string, notes?: string): Promise<{ success: boolean; message: string }> {
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
    async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<IAdminOrder> {
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

    // ==================== 用戶管理方法 ====================

    /**
     * 獲取所有用戶列表（管理員視圖）
     * @returns Promise<{ users: IAdminUser[], meta: Record<string, unknown> }> 用戶列表和統計資訊
     */
    async getUsers(): Promise<{ users: IAdminUser[]; meta: Record<string, unknown> }> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/users`)

            const users = Array.isArray(response.data) ? (response.data as IAdminUser[]) : []
            const meta = response.meta || {}

            return {
                users,
                meta,
            }
        } catch (error) {
            console.error('Error fetching admin users:', error)
            throw error
        }
    }

    /**
     * 獲取單一用戶詳細資訊（管理員視圖）
     * @param id 用戶 ID
     * @returns Promise<IAdminUser> 用戶詳細資訊
     */
    async getUserById(id: number): Promise<IAdminUser> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/users/${id}`)
            // API 客戶端已經處理了 JSON:API 格式和 camelCase 轉換
            return response.data as IAdminUser
        } catch (error) {
            console.error('Error fetching user details:', error)
            throw error
        }
    }

    /**
     * 切換用戶黑名單狀態
     * @param id 用戶 ID
     * @returns Promise<{ success: boolean; message: string }> 更新結果
     */
    async toggleUserBlacklist(id: number): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/users/${id}/blacklist`)
            const apiResponse = response.data as IApiResponse
            return {
                success: true,
                message: apiResponse.message || 'Blacklist status updated successfully',
            }
        } catch (error) {
            console.error('Error updating blacklist status:', error)
            throw error
        }
    }

    /**
     * 切換用戶可疑狀態
     * @param id 用戶 ID
     * @returns Promise<{ success: boolean; message: string }> 更新結果
     */
    async toggleUserSuspicious(id: number): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/users/${id}/suspicious`)
            const apiResponse = response.data as IApiResponse
            return {
                success: true,
                message: apiResponse.message || 'Suspicious status updated successfully',
            }
        } catch (error) {
            console.error('Error updating suspicious status:', error)
            throw error
        }
    }

    /**
     * 設定用戶為管理員
     * @param id 用戶 ID
     * @returns Promise<{ success: boolean; message: string }> 更新結果
     */
    async makeUserAdmin(id: number): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/users/${id}/make_admin`)
            const apiResponse = response.data as IApiResponse
            return {
                success: true,
                message: apiResponse.message || 'User made admin successfully',
            }
        } catch (error) {
            console.error('Error making user admin:', error)
            throw error
        }
    }

    /**
     * 移除用戶管理員權限
     * @param id 用戶 ID
     * @returns Promise<{ success: boolean; message: string }> 更新結果
     */
    async removeUserAdmin(id: number): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/users/${id}/remove_admin`)
            const apiResponse = response.data as IApiResponse
            return {
                success: true,
                message: apiResponse.message || 'Admin privileges removed successfully',
            }
        } catch (error) {
            console.error('Error removing admin privileges:', error)
            throw error
        }
    }

    // ==================== 網站配置管理方法 ====================

    /**
     * 獲取網站配置
     * @returns Promise<SiteConfiguration> 網站配置
     */
    async getSiteConfigurations(): Promise<SiteConfiguration> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/site_configurations`)
            return response.data as SiteConfiguration
        } catch (error) {
            console.error('Error fetching site configurations:', error)
            throw error
        }
    }

    /**
     * 更新網站配置
     * @param settings 配置資料
     * @returns Promise<SiteConfiguration> 更新後的配置
     */
    async updateSiteConfigurations(settings: Partial<SiteConfiguration>): Promise<SiteConfiguration> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/site_configurations`, { settings })
            return response.data as SiteConfiguration
        } catch (error) {
            console.error('Error updating site configurations:', error)
            throw error
        }
    }

    /**
     * 獲取銀行資訊
     * @returns Promise<BankAccountInfo> 銀行資訊
     */
    async getBankInfo(): Promise<BankAccountInfo> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/site_configurations/bank_info`)
            return response.data as BankAccountInfo
        } catch (error) {
            console.error('Error fetching bank info:', error)
            throw error
        }
    }

    // ==================== 訊息管理方法 ====================

    /**
     * 獲取所有訊息列表（管理員視圖）
     * @param params 查詢參數
     * @returns Promise<JSONAPIResponse<IAdminMessage[]>> 訊息列表和統計資訊
     */
    async getMessages(
        params: {
            limit?: number
        } = {}
    ): Promise<JSONAPIResponse<IAdminMessage[]>> {
        try {
            const queryParams = new URLSearchParams()

            if (params.limit) queryParams.append('limit', params.limit.toString())

            const response = await apiClient.get(`${this.baseUrl}/messages?${queryParams.toString()}`)

            // 返回完整的 JSON:API 回應
            return response as JSONAPIResponse<IAdminMessage[]>
        } catch (error) {
            console.error('Error fetching admin messages:', error)
            throw error
        }
    }

    /**
     * 獲取特定對話的訊息
     * @param bicycleId 自行車 ID
     * @param senderId 發送者 ID
     * @param receiverId 接收者 ID
     * @returns Promise<JSONAPIResponse<IAdminMessage[]>> 對話訊息
     */
    async getConversation(
        bicycleId: string,
        senderId: string,
        receiverId: string
    ): Promise<JSONAPIResponse<IAdminMessage[]>> {
        try {
            const queryParams = new URLSearchParams({
                bicycle_id: bicycleId,
                sender_id: senderId,
                receiver_id: receiverId,
            })

            const response = await apiClient.get(`${this.baseUrl}/messages/conversations?${queryParams.toString()}`)

            // 返回完整的 JSON:API 回應
            return response as JSONAPIResponse<IAdminMessage[]>
        } catch (error) {
            console.error('Error fetching conversation:', error)
            throw error
        }
    }
}

// 匯出單例實例
export const adminService = new AdminService()
export default adminService
