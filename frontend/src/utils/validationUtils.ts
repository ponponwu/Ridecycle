/**
 * 驗證相關的實用工具函數
 */

// 驗證台灣手機號碼格式
export const validateTaiwanMobile = (phone: string): boolean => {
    const mobileRegex = /^09\d{8}$/
    return mobileRegex.test(phone)
}

// 驗證台灣市話號碼格式
export const validateTaiwanLandline = (phone: string): boolean => {
    const landlineRegex = /^0\d{1,2}-?\d{6,8}$/
    return landlineRegex.test(phone)
}

// 驗證郵遞區號格式
export const validatePostalCode = (postalCode: string): boolean => {
    const postalRegex = /^\d{3,5}$/
    return postalRegex.test(postalCode)
}

// 格式化台灣手機號碼 (09XX-XXX-XXX)
export const formatTaiwanMobile = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length === 10 && cleanPhone.startsWith('09')) {
        return `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`
    }
    return phone
}