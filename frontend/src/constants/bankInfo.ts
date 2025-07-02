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
 * RideCycle 平台收款銀行資訊
 * RideCycle platform bank account information
 */
export const RIDE_CYCLE_BANK_INFO: BankAccountInfo = {
  bankName: '玉山銀行',
  bankCode: '808',
  accountNumber: '1234567890123',
  accountName: 'RideCycle 有限公司',
  branch: '台北分行',
}

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