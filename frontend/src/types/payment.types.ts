/**
 * 付款相關型別定義
 * Payment-related type definitions
 */

export type PaymentStatus = 'pending' | 'paid' | 'awaiting_confirmation' | 'expired' | 'cancelled'

export type PaymentProofStatus = 'uploaded' | 'pending' | 'approved' | 'rejected'

export interface PaymentProofInfo {
  id: string
  hasProof: boolean
  status: PaymentProofStatus
  uploadedAt?: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  proofUrl?: string
  fileName?: string
  fileSize?: number
  message?: string // 用戶提供的文字說明
}

export interface PaymentUploadData {
  file: File
  message?: string // 可選的文字說明
}

export interface PaymentUploadResult {
  success: boolean
  message?: string
  proofInfo?: PaymentProofInfo
}

/**
 * 銀行帳戶資訊顯示模式
 * Bank account information display modes
 */
export type BankInfoDisplayMode = 'compact' | 'full' | 'readonly'

/**
 * 可複製的銀行資訊欄位
 * Copyable bank information fields
 */
export type CopyableField = 'bankName' | 'bankCode' | 'accountNumber' | 'accountName' | 'amount' | 'transferNote'

/**
 * 付款證明上傳組件的狀態
 * Payment proof upload component state
 */
export interface PaymentProofUploadState {
  isDragOver: boolean
  isUploading: boolean
  uploadProgress?: number
  selectedFile?: File
  previewUrl?: string
  message: string
  error?: string
}