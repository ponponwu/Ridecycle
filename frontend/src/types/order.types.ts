// src/types/order.types.ts
import { IBicycle } from './bicycle.types' // Changed from IBicycleCartItem

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
 * 用戶資訊介面（買家或賣家）
 */
export interface IOrderUser {
    id: string
    name: string
    fullName: string
    email: string
    avatarUrl?: string
}

/**
 * 訂單中的自行車資訊介面
 */
export interface IOrderBicycle {
    id: string
    title: string
    price: number
    status: string
    brand?: string
    model?: string
    mainPhotoUrl?: string
}

/**
 * 付款狀態類型
 */
export type PaymentStatus = 'pending' | 'awaiting_confirmation' | 'paid' | 'failed' | 'refunded'

/**
 * 訂單詳情介面（與後端 JSON:API 格式匹配）
 */
export interface IOrder {
    id: string
    orderNumber: string
    totalPrice: number
    status: string
    paymentStatus: PaymentStatus
    createdAt: string
    updatedAt: string
    shippingMethod: string
    shippingCost: number
    shippingDistance?: number
    paymentMethod: string
    paymentDeadline?: string
    expiresAt?: string
    paymentInstructions?: string
    companyAccountInfo?: string

    // 用戶資訊
    buyer?: IOrderUser
    seller?: IOrderUser

    // 自行車資訊
    bicycle?: IOrderBicycle

    // 配送地址（JSON:API 格式）
    shippingAddress?: Record<string, unknown>

    // 付款詳情（已過濾敏感資訊）
    paymentDetails?: Record<string, unknown>

    // 其他資訊
    estimatedDeliveryDate?: string
    trackingNumber?: string
    remainingPaymentHours?: number
    remainingPaymentTimeHumanized?: string
    expired?: boolean

    // 向後兼容的欄位
    userId?: string
    subtotal?: number
    tax?: number
    total?: number
    carrier?: string
    notes?: string
    cancelReason?: string
    paymentId?: string
    rating?: number
    review?: string
    estimatedDelivery?: string

    // 付款證明資訊 (使用新的 ActiveStorage 架構)
    paymentProofInfo?: {
        hasProof: boolean
        status: 'none' | 'pending' | 'approved' | 'rejected'
        filename?: string
        uploadedAt?: string
        fileSize?: number
        contentType?: string
        metadata?: Record<string, unknown>
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
 * 後端 API 訂單創建數據介面 (符合後端控制器格式)
 */
export interface IOrderCreateRequest {
    order: {
        bicycle_id: string
        total_price: number
        payment_method: string
        shipping_method: string
        shipping_distance?: number
        shipping_address: {
            full_name: string
            phone_number: string
            county: string
            district: string
            address_line1: string
            address_line2?: string
            postal_code: string
            delivery_notes?: string
        }
        payment_details: {
            transfer_note?: string
            account_last_five_digits?: string
            transfer_proof_url?: string
        }
        delivery_option: {
            type: string
            cost: number
            estimated_days_min: number
            estimated_days_max: number
            note?: string
        }
    }
}

/**
 * 訂單狀態更新介面
 */
export interface IOrderStatusUpdate {
    status: string // Was OrderStatus
    notes?: string
}

/**
 * 訂單列表參數介面
 */
export interface IOrderListParams {
    page?: number
    limit?: number
    status?: string[] // Was OrderStatus[]
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
