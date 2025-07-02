/**
 * 訂單計算工具
 * 統一處理價格計算邏輯
 */

import { IBicycle } from '@/types/bicycle.types'

export interface OrderCalculation {
    subtotal: number
    shipping: number
    tax: number
    total: number
}

/**
 * 計算訂單價格明細
 * @param bicycle 自行車資訊
 * @param shippingCost 運費（可選，默認為100）
 * @param taxRate 稅率（可選，默認為5%）
 * @returns 價格計算結果
 */
export const calculateOrderPrices = (
    bicycle: IBicycle,
    shippingCost: number = 100,
    taxRate: number = 0.05
): OrderCalculation => {
    const subtotal = bicycle.price
    const shipping = shippingCost
    const tax = Math.round(subtotal * taxRate)
    const total = subtotal + shipping + tax

    return {
        subtotal,
        shipping,
        tax,
        total,
    }
}

/**
 * 台灣地區運費計算
 * @param city 城市名稱（如：台北市、高雄市）
 * @param weight 重量（公斤）
 * @returns 運費
 */
export const calculateShippingCost = (city: string, weight?: number): number => {
    const baseShipping = 100 // 基本運費

    // 偏遠地區額外運費
    const remoteRegions = ['澎湖縣', '金門縣', '連江縣', '台東縣', '花蓮縣']
    const remoteAdditional = 50

    let shippingCost = baseShipping

    // 偏遠地區加價
    if (remoteRegions.includes(city)) {
        shippingCost += remoteAdditional
    }

    // 重量超過10公斤額外收費
    if (weight && weight > 10) {
        const extraWeight = Math.ceil(weight - 10)
        shippingCost += extraWeight * 20 // 每公斤加收20元
    }

    return shippingCost
}

/**
 * 計算預估到貨時間
 * @param city 城市名稱（如：台北市、高雄市）
 * @returns 到貨天數範圍
 */
export const calculateDeliveryTime = (city: string): { min: number; max: number } => {
    const remoteRegions = ['澎湖縣', '金門縣', '連江縣']
    const mountainRegions = ['南投縣', '花蓮縣', '台東縣']

    if (remoteRegions.includes(city)) {
        return { min: 5, max: 7 } // 離島地區
    }

    if (mountainRegions.includes(city)) {
        return { min: 4, max: 6 } // 山區地區
    }

    return { min: 3, max: 5 } // 一般地區
}

/**
 * 生成訂單編號
 * 格式：RC{YYYYMMDD}{序號} 例如：RC202501020001
 * @returns 訂單編號
 */
export const generateOrderId = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    
    // 生成4位序號（可考慮用數據庫自增ID或Redis計數器）
    const sequence = Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, '0')
    
    return `RC${year}${month}${day}${sequence}`
}

/**
 * 驗證訂單資料完整性
 * @param bicycle 自行車資訊
 * @param shippingInfo 配送資訊
 * @param paymentInfo 付款資訊（可選，新流程中付款資訊在訂單創建後提供）
 * @returns 驗證結果
 */
export const validateOrderData = (bicycle: unknown, shippingInfo: unknown, paymentInfo?: unknown): boolean => {
    // 檢查 null 和 undefined
    if (!bicycle || !shippingInfo) {
        return false
    }

    // 檢查必要欄位
    const requiredBicycleFields = ['id', 'title', 'price']
    const requiredShippingFields = ['fullName', 'phoneNumber', 'city', 'district', 'addressLine1', 'postalCode']

    const bicycleValid = requiredBicycleFields.every((field) => (bicycle as Record<string, unknown>)[field])
    const shippingValid = requiredShippingFields.every((field) => (shippingInfo as Record<string, unknown>)[field])

    // 在新流程中，付款資訊是可選的（訂單創建後才提供）
    return bicycleValid && shippingValid
}
