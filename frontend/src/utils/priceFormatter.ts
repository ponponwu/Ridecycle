/**
 * 價錢格式化工具
 * 統一使用新台幣 (NTD) 格式
 */

export interface PriceFormatOptions {
    currency?: 'NTD' | 'TWD' | 'NT$'
    showSymbol?: boolean
    showCurrency?: boolean
    locale?: string
}

/**
 * 格式化價錢為新台幣格式
 * @param price 價錢數值
 * @param options 格式化選項
 * @returns 格式化後的價錢字串
 */
export const formatPrice = (price: number | string, options: PriceFormatOptions = {}): string => {
    const { currency = 'NT$', showSymbol = true, showCurrency = false, locale = 'zh-TW' } = options

    // 轉換為數字
    const numPrice = typeof price === 'string' ? parseFloat(price) : price

    // 檢查是否為有效數字
    if (isNaN(numPrice)) {
        return 'N/A'
    }

    // 格式化數字（加入千分位逗號）
    const formattedNumber = numPrice.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })

    // 根據選項組合結果
    if (showSymbol && showCurrency) {
        return `NT$ ${formattedNumber} ${currency === 'NTD' ? 'NTD' : ''}`
    } else if (showSymbol) {
        return `NT$ ${formattedNumber}`
    } else if (showCurrency) {
        return `${formattedNumber} NTD`
    } else {
        return formattedNumber
    }
}

/**
 * 格式化台幣價格
 * @param price 價格數字
 * @param showCurrency 是否顯示貨幣符號
 * @returns 格式化後的價格字串
 */
export const formatPriceNTD = (price: number, showCurrency: boolean = true): string => {
    if (typeof price !== 'number' || isNaN(price)) {
        return showCurrency ? 'NT$ 0' : '0'
    }

    // 將數字格式化為千位分隔符
    const formattedNumber = new Intl.NumberFormat('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)

    return showCurrency ? `NT$ ${formattedNumber}` : formattedNumber
}

/**
 * 格式化價格範圍
 * @param minPrice 最低價格
 * @param maxPrice 最高價格
 * @returns 格式化後的價格範圍字串
 */
export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
    return `${formatPriceNTD(minPrice)} - ${formatPriceNTD(maxPrice)}`
}

/**
 * 解析價格字串為數字
 * @param priceString 價格字串
 * @returns 數字價格
 */
export const parsePriceString = (priceString: string): number => {
    // 移除所有非數字字符（除了小數點）
    const cleanString = priceString.replace(/[^\d.]/g, '')
    const parsed = parseFloat(cleanString)
    return isNaN(parsed) ? 0 : parsed
}

/**
 * 計算折扣後價格
 * @param originalPrice 原價
 * @param discountPercentage 折扣百分比 (0-100)
 * @returns 折扣後價格
 */
export const calculateDiscountPrice = (originalPrice: number, discountPercentage: number): number => {
    if (discountPercentage < 0 || discountPercentage > 100) {
        throw new Error('折扣百分比必須在 0-100 之間')
    }
    return originalPrice * (1 - discountPercentage / 100)
}

/**
 * 格式化折扣顯示
 * @param originalPrice 原價
 * @param discountedPrice 折扣價
 * @returns 格式化的折扣顯示
 */
export const formatDiscountDisplay = (originalPrice: number, discountedPrice: number) => {
    const discountAmount = originalPrice - discountedPrice
    const discountPercentage = Math.round((discountAmount / originalPrice) * 100)

    return {
        originalPrice: formatPriceNTD(originalPrice),
        discountedPrice: formatPriceNTD(discountedPrice),
        discountAmount: formatPriceNTD(discountAmount),
        discountPercentage: `${discountPercentage}%`,
    }
}

/**
 * 驗證價錢是否有效
 * @param price 價錢值
 * @returns 是否為有效價錢
 */
export const isValidPrice = (price: number | string): boolean => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return !isNaN(numPrice) && numPrice >= 0
}
