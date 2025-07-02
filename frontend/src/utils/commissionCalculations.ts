/**
 * 手續費計算工具
 * Commission fee calculation utilities
 */

/**
 * 平台手續費率 (3.5%)
 * Platform commission rate (3.5%)
 */
export const COMMISSION_RATE = 0.035

/**
 * 手續費計算結果介面
 * Commission calculation result interface
 */
export interface CommissionCalculation {
  /** 商品原價 (消費者支付金額) */
  originalPrice: number
  /** 手續費金額 */
  commissionFee: number
  /** 手續費率 */
  commissionRate: number
  /** 賣家實際收到金額 */
  sellerReceives: number
}

/**
 * 計算手續費和賣家實收金額
 * Calculate commission fee and seller's actual income
 * 
 * @param price 商品價格 (消費者支付的金額)
 * @param commissionRate 手續費率 (預設 3.5%)
 * @returns 手續費計算結果
 */
export const calculateCommission = (
  price: number,
  commissionRate: number = COMMISSION_RATE
): CommissionCalculation => {
  if (price <= 0) {
    return {
      originalPrice: 0,
      commissionFee: 0,
      commissionRate,
      sellerReceives: 0,
    }
  }

  const commissionFee = Math.round(price * commissionRate)
  const sellerReceives = price - commissionFee

  return {
    originalPrice: price,
    commissionFee,
    commissionRate,
    sellerReceives,
  }
}

/**
 * 根據期望收入計算建議售價
 * Calculate suggested selling price based on desired income
 * 
 * @param desiredIncome 期望收入
 * @param commissionRate 手續費率 (預設 3.5%)
 * @returns 建議售價
 */
export const calculateSuggestedPrice = (
  desiredIncome: number,
  commissionRate: number = COMMISSION_RATE
): number => {
  if (desiredIncome <= 0) return 0
  
  // 計算公式: 期望收入 = 售價 × (1 - 手續費率)
  // 因此: 售價 = 期望收入 ÷ (1 - 手續費率)
  const suggestedPrice = Math.ceil(desiredIncome / (1 - commissionRate))
  return suggestedPrice
}

/**
 * 格式化手續費率為百分比顯示
 * Format commission rate as percentage
 * 
 * @param rate 手續費率 (0.035 for 3.5%)
 * @returns 格式化的百分比字串 (例: "3.5%")
 */
export const formatCommissionRate = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`
}

/**
 * 驗證價格輸入是否有效
 * Validate if price input is valid
 * 
 * @param price 價格
 * @returns 是否有效
 */
export const isValidPrice = (price: number): boolean => {
  return price > 0 && price <= 9999999 && Number.isFinite(price)
}