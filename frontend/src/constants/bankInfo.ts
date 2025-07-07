/**
 * 統一的銀行帳戶資訊管理
 * Unified bank account information management
 */

export interface BankAccountInfo {
  bankName: string
  bankCode: string
  accountNumber: string
  accountName: string
  branch: string
}

/**
 * 預設的銀行資訊（作為備用）
 * Default bank information (as fallback)
 */
const DEFAULT_BANK_INFO: BankAccountInfo = {
  bankName: '玉山銀行',
  bankCode: '808',
  accountNumber: '1234567890123',
  accountName: 'RideCycle 有限公司',
  branch: '台北分行',
}

// 快取銀行資訊
let cachedBankInfo: BankAccountInfo | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分鐘

/**
 * 獲取 RideCycle 平台收款銀行資訊
 * Get RideCycle platform bank account information
 */
export async function getRideCycleBankInfo(): Promise<BankAccountInfo> {
  // 檢查快取是否有效
  const now = Date.now()
  if (cachedBankInfo && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedBankInfo
  }

  try {
    // 動態載入 adminService 避免循環依賴
    const { adminService } = await import('@/services/admin.service')
    const bankInfo = await adminService.getBankInfo()
    
    // 更新快取
    cachedBankInfo = bankInfo
    cacheTimestamp = now
    
    return bankInfo
  } catch (error) {
    console.error('Failed to fetch bank info from API, using default:', error)
    // 如果 API 失敗，使用預設值
    return DEFAULT_BANK_INFO
  }
}

/**
 * 清除快取（當銀行資訊更新時調用）
 * Clear cache (call when bank info is updated)
 */
export function clearBankInfoCache(): void {
  cachedBankInfo = null
  cacheTimestamp = 0
}

/**
 * RideCycle 平台收款銀行資訊（同步版本，使用快取或預設值）
 * RideCycle platform bank account information (sync version, using cache or default)
 */
export const RIDE_CYCLE_BANK_INFO: BankAccountInfo = DEFAULT_BANK_INFO

/**
 * 銀行資訊欄位對應的翻譯鍵值
 * Translation keys for bank information fields
 */
export const BANK_FIELD_TRANSLATION_KEYS = {
  bankName: 'bankName',
  bankCode: 'bankCodeLabel',
  accountNumber: 'accountNumber',
  accountName: 'accountName',
  branch: 'branchLabel',
  transferAmount: 'transferAmountLabel',
  transferNote: 'orderTransferNote',
} as const