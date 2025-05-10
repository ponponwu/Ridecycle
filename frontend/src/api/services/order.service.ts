// src/api/services/order.service.ts
import apiClient from '../client'
import {
    IOrder,
    IOrderCreateData,
    IOrderListParams,
    IOrderListResponse,
    IOrderStatusUpdate,
    IPaymentMethod,
    IShippingMethod,
    IShippingAddress,
    IPaymentDetails,
    IPaymentResult,
    IOrderStats,
} from '@/types/order.types'

/**
 * 訂單相關 API 服務
 */
export class OrderService {
    /**
     * 獲取訂單列表
     * @param {IOrderListParams} params - 列表參數
     * @returns {Promise<IOrderListResponse>} 訂單列表響應
     */
    public async getOrders(params?: IOrderListParams): Promise<IOrderListResponse> {
        return apiClient.get<IOrderListResponse>('/orders', { params })
    }

    /**
     * 獲取訂單詳情
     * @param {string} id - 訂單 ID
     * @returns {Promise<IOrder>} 訂單詳情
     */
    public async getOrderById(id: string): Promise<IOrder> {
        return apiClient.get<IOrder>(`/orders/${id}`)
    }

    /**
     * 創建新訂單
     * @param {IOrderCreateData} data - 訂單創建數據
     * @returns {Promise<IOrder>} 創建的訂單
     */
    public async createOrder(data: IOrderCreateData): Promise<IOrder> {
        return apiClient.post<IOrder>('/orders', data)
    }

    /**
     * 更新訂單狀態
     * @param {string} id - 訂單 ID
     * @param {IOrderStatusUpdate} data - 狀態更新數據
     * @returns {Promise<IOrder>} 更新後的訂單
     */
    public async updateOrderStatus(id: string, data: IOrderStatusUpdate): Promise<IOrder> {
        return apiClient.patch<IOrder>(`/orders/${id}/status`, data)
    }

    /**
     * 取消訂單
     * @param {string} id - 訂單 ID
     * @param {string} reason - 取消原因
     * @returns {Promise<IOrder>} 更新後的訂單
     */
    public async cancelOrder(id: string, reason: string): Promise<IOrder> {
        return apiClient.post<IOrder>(`/orders/${id}/cancel`, { reason })
    }

    /**
     * 獲取買家訂單列表
     * @param {IOrderListParams} params - 列表參數
     * @returns {Promise<IOrderListResponse>} 訂單列表響應
     */
    public async getBuyerOrders(params?: IOrderListParams): Promise<IOrderListResponse> {
        return apiClient.get<IOrderListResponse>('/orders/buyer', { params })
    }

    /**
     * 獲取賣家訂單列表
     * @param {IOrderListParams} params - 列表參數
     * @returns {Promise<IOrderListResponse>} 訂單列表響應
     */
    public async getSellerOrders(params?: IOrderListParams): Promise<IOrderListResponse> {
        return apiClient.get<IOrderListResponse>('/orders/seller', { params })
    }

    /**
     * 提供追蹤號碼
     * @param {string} id - 訂單 ID
     * @param {string} trackingNumber - 追蹤號碼
     * @param {string} carrier - 物流公司
     * @returns {Promise<IOrder>} 更新後的訂單
     */
    public async provideTracking(id: string, trackingNumber: string, carrier: string): Promise<IOrder> {
        return apiClient.post<IOrder>(`/orders/${id}/tracking`, {
            tracking_number: trackingNumber,
            carrier,
        })
    }

    /**
     * 確認訂單完成
     * @param {string} id - 訂單 ID
     * @returns {Promise<IOrder>} 更新後的訂單
     */
    public async confirmDelivery(id: string): Promise<IOrder> {
        return apiClient.post<IOrder>(`/orders/${id}/confirm-delivery`)
    }

    /**
     * 評價訂單
     * @param {string} id - 訂單 ID
     * @param {number} rating - 評分（1-5）
     * @param {string} comment - 評價內容
     * @returns {Promise<IOrder>} 更新後的訂單
     */
    public async rateOrder(id: string, rating: number, comment: string): Promise<IOrder> {
        return apiClient.post<IOrder>(`/orders/${id}/rate`, {
            rating,
            comment,
        })
    }

    /**
     * 獲取可用的付款方式
     * @returns {Promise<IPaymentMethod[]>} 付款方式列表
     */
    public async getPaymentMethods(): Promise<IPaymentMethod[]> {
        return apiClient.get<IPaymentMethod[]>('/orders/payment-methods')
    }

    /**
     * 獲取可用的物流方式
     * @returns {Promise<IShippingMethod[]>} 物流方式列表
     */
    public async getShippingMethods(): Promise<IShippingMethod[]> {
        return apiClient.get<IShippingMethod[]>('/orders/shipping-methods')
    }

    /**
     * 保存配送地址
     * @param {IShippingAddress} address - 配送地址
     * @returns {Promise<IShippingAddress>} 保存的地址
     */
    public async saveShippingAddress(address: IShippingAddress): Promise<IShippingAddress> {
        return apiClient.post<IShippingAddress>('/orders/shipping-address', address)
    }

    /**
     * 獲取用戶的配送地址
     * @returns {Promise<IShippingAddress[]>} 配送地址列表
     */
    public async getShippingAddresses(): Promise<IShippingAddress[]> {
        return apiClient.get<IShippingAddress[]>('/orders/shipping-addresses')
    }

    /**
     * 處理付款
     * @param {string} orderId - 訂單 ID
     * @param {string} paymentMethodId - 付款方式 ID
     * @param {IPaymentDetails} paymentDetails - 付款詳情
     * @returns {Promise<IPaymentResult>} 付款結果
     */
    public async processPayment(
        orderId: string,
        paymentMethodId: string,
        paymentDetails: IPaymentDetails
    ): Promise<IPaymentResult> {
        return apiClient.post<IPaymentResult>(`/orders/${orderId}/payment`, {
            payment_method_id: paymentMethodId,
            payment_details: paymentDetails,
        })
    }

    /**
     * 獲取訂單統計數據
     * @returns {Promise<IOrderStats>} 訂單統計
     */
    public async getOrderStats(): Promise<IOrderStats> {
        return apiClient.get<IOrderStats>('/orders/stats')
    }
}

// 創建並導出

export const orderService = new OrderService()
export default orderService
