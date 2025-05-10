// src/types/order.types.ts
import { IBicycleCartItem } from './bicycle.types'

/**
 * 訂單狀態枚舉
 */
export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

/**
 * 訂單詳情介面
 */
export interface IOrder {
    id: string
    userId: string
    sellerId: string
    orderNumber: string
    items: IBicycleCartItem[]
    status: OrderStatus
    shippingAddress: IShippingAddress
    paymentMethod: IPaymentMethod
    shippingMethod: IShippingMethod
    subtotal: number
    shippingCost: number
    tax: number
    total: number
    trackingNumber?: string
    carrier?: string
    notes?: string
    cancelReason?: string
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
    paymentId?: string
    rating?: number
    review?: string
    createdAt: string
    updatedAt: string
    estimatedDelivery?: string
    buyer: {
        id: string
        fullName: string
        email: string
        avatar?: string
    }
    seller: {
        id: string
        fullName: string
        email: string
        avatar?: string
    }
}

/**
 * 配送地址介面
 */
export interface IShippingAddress {
    id?: string
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phoneNumber: string
    isDefault?: boolean
    label?: string // 例如：家、辦公室等
}

/**
 * 付款方式介面
 */
export interface IPaymentMethod {
    id: string
    name: string
    type: 'credit_card' | 'paypal' | 'bank_transfer' | 'other'
    icon?: string
    description?: string
    isEnabled: boolean
}

/**
 * 物流方式介面
 */
export interface IShippingMethod {
    id: string
    name: string
    description?: string
    price: number
    estimatedDays: number
    isEnabled: boolean
}

/**
 * 訂單創建數據介面
 */
export interface IOrderCreateData {
    items: string[] // 自行車 ID 列表
    shippingAddressId: string
    paymentMethodId: string
    shippingMethodId: string
    notes?: string
}

/**
 * 訂單狀態更新介面
 */
export interface IOrderStatusUpdate {
    status: OrderStatus
    notes?: string
}

/**
 * 訂單列表參數介面
 */
export interface IOrderListParams {
    page?: number
    limit?: number
    status?: OrderStatus[]
    startDate?: string
    endDate?: string
    sort?: 'newest' | 'oldest' | 'price_high' | 'price_low'
}

/**
 * 訂單列表響應介面
 */
export interface IOrderListResponse {
    orders: IOrder[]
    totalCount: number
    page: number
    limit: number
    totalPages: number
}

/**
 * 付款詳情介面
 */
export interface IPaymentDetails {
    cardNumber?: string
    cardHolder?: string
    expiryDate?: string
    cvv?: string
    billingAddress?: IShippingAddress
    [key: string]: string | IShippingAddress | undefined
}

/**
 * 付款結果介面
 */
export interface IPaymentResult {
    success: boolean
    transactionId?: string
    message?: string
    status: 'completed' | 'pending' | 'failed'
    paymentDate?: string
    amount: number
    currency: string
    paymentMethod: string
}

/**
 * 訂單統計介面
 */
export interface IOrderStats {
    totalOrders: number
    totalSales: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
    completedOrders: number
    cancelledOrders: number
    refundedOrders: number
    averageOrderValue: number
    monthlySales: {
        month: string
        sales: number
        orders: number
    }[]
}
