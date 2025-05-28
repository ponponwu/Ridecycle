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
 * 簡化的價錢格式化（預設使用 NT$ 符號）
 * @param price 價錢數值
 * @returns NT$ 格式的價錢字串
 */
export const formatPriceNTD = (price: number | string): string => {
    return formatPrice(price, { showSymbol: true })
}

/**
 * 格式化價錢範圍
 * @param minPrice 最低價錢
 * @param maxPrice 最高價錢
 * @returns 格式化後的價錢範圍字串
 */
export const formatPriceRange = (minPrice: number | string, maxPrice: number | string): string => {
    const min = formatPriceNTD(minPrice)
    const max = formatPriceNTD(maxPrice)
    return `${min} - ${max}`
}

/**
 * 解析價錢字串為數字
 * @param priceString 價錢字串
 * @returns 數字價錢
 */
export const parsePrice = (priceString: string): number => {
    // 移除所有非數字字符（除了小數點）
    const cleanString = priceString.replace(/[^\d.]/g, '')
    const parsed = parseFloat(cleanString)
    return isNaN(parsed) ? 0 : parsed
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
