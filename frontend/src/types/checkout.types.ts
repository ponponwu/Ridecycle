/**
 * Checkout 相關類型定義
 */

export interface IShippingInfo {
    fullName: string
    phoneNumber: string
    city: string
    district: string
    addressLine1: string
    addressLine2?: string
    postalCode: string
    deliveryNotes?: string
}

export interface IPaymentInfo {
    paymentMethod: 'bankTransfer' | 'creditCard'
    transferProof?: File // 轉帳證明
    transferNote?: string // 轉帳備註
    accountLastFiveDigits?: string // 轉帳帳戶後五碼
}

export interface IDeliveryOption {
    type: 'delivery' | 'pickup' // 配送 或 面交
    cost: number // 運費成本
    estimatedDays?: { min: number; max: number } // 預估天數
    note?: string // 備註
}

export interface IOrderSummary {
    subtotal: number
    shipping: number
    tax: number
    total: number
    deliveryOption: IDeliveryOption
}

export interface ICheckoutStep {
    id: number
    title: string
    completed: boolean
    active: boolean
}

// 公司銀行帳戶資訊
export interface IBankAccount {
    bankName: string
    bankCode: string
    accountNumber: string
    accountName: string
    branch?: string
}
