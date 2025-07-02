import React, { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { orderService } from '@/api/services/order.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  Loader2, 
  Check, 
  X, 
  AlertCircle, 
  Image as ImageIcon,
  FileText
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { 
  PaymentProofUploadState, 
  PaymentUploadData, 
  PaymentUploadResult,
  PaymentProofInfo,
  PaymentProofStatus
} from '@/types/payment.types'

interface PaymentProofUploadProps {
  /**
   * 訂單ID
   */
  orderId: string
  /**
   * 現有的付款證明資訊
   */
  existingProof?: PaymentProofInfo
  /**
   * 上傳成功回調
   */
  onUploadSuccess?: (proofInfo: PaymentProofInfo) => void
  /**
   * 上傳失敗回調
   */
  onUploadError?: (error: string) => void
  /**
   * 自定義標題
   */
  title?: string
  /**
   * 是否顯示卡片容器
   */
  showCard?: boolean
  /**
   * 額外的樣式類名
   */
  className?: string
}

const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  orderId,
  existingProof,
  onUploadSuccess,
  onUploadError,
  title,
  showCard = true,
  className = '',
}) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [state, setState] = useState<PaymentProofUploadState>({
    isDragOver: false,
    isUploading: false,
    message: existingProof?.message || '',
  })

  // 文件驗證
  const validateFile = (file: File): string | null => {
    // 檢查檔案大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return t('fileTooLarge', '檔案太大，請選擇小於 5MB 的檔案')
    }

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      return t('invalidFileType', '請選擇圖片檔案（JPG、PNG、GIF）')
    }

    return null
  }

  // 處理文件選擇
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      setState(prev => ({ ...prev, error }))
      toast({
        title: t('uploadFailed', '上傳失敗'),
        description: error,
        variant: 'destructive',
      })
      return
    }

    // 創建預覽URL
    const previewUrl = URL.createObjectURL(file)
    
    setState(prev => ({
      ...prev,
      selectedFile: file,
      previewUrl,
      error: undefined,
    }))
  }, [t, toast])

  // 拖拽處理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragOver: true }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragOver: false }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragOver: false }))
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  // 文件輸入處理
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // 清除選擇的文件
  const clearSelectedFile = () => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl)
    }
    setState(prev => ({
      ...prev,
      selectedFile: undefined,
      previewUrl: undefined,
      error: undefined,
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 更新訊息
  const handleMessageChange = (message: string) => {
    setState(prev => ({ ...prev, message }))
  }

  // 上傳付款證明
  const handleUpload = async () => {
    if (!state.selectedFile && !state.message.trim()) {
      toast({
        title: t('uploadFailed', '上傳失敗'),
        description: t('pleaseSelectFileOrMessage', '請選擇檔案或填寫文字說明'),
        variant: 'destructive',
      })
      return
    }

    setState(prev => ({ ...prev, isUploading: true, error: undefined }))

    try {
      // 調用實際的上傳API
      const result = await orderService.uploadPaymentProof(orderId, state.selectedFile!)

      if (result.success) {
        // 構建 PaymentProofInfo 格式的結果
        const proofInfo: PaymentProofInfo = {
          id: `proof_${orderId}_${Date.now()}`,
          hasProof: true,
          status: 'pending' as PaymentProofStatus,
          uploadedAt: new Date().toISOString(),
          fileName: state.selectedFile?.name,
          fileSize: state.selectedFile?.size,
          message: state.message.trim() || undefined,
        }

        toast({
          title: t('uploadSuccessTitle', '上傳成功'),
          description: result.message || t('uploadSuccessMessage', '轉帳證明已上傳，請等待確認'),
        })
        
        onUploadSuccess?.(proofInfo)
        
        // 清除狀態
        clearSelectedFile()
        setState(prev => ({ ...prev, message: '' }))
      } else {
        throw new Error(result.message || t('uploadFailedMessage', '上傳失敗'))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('uploadFailedMessage', '上傳失敗')
      setState(prev => ({ ...prev, error: errorMessage }))
      toast({
        title: t('uploadFailedTitle', '上傳失敗'),
        description: errorMessage,
        variant: 'destructive',
      })
      onUploadError?.(errorMessage)
    } finally {
      setState(prev => ({ ...prev, isUploading: false }))
    }
  }

  // 狀態顯示
  const getStatusDisplay = () => {
    if (!existingProof) return null

    const statusConfig = {
      uploaded: { color: 'blue', label: t('proofUploaded', '已上傳證明') },
      pending: { color: 'orange', label: t('paymentPending', '審核中') },
      approved: { color: 'green', label: t('paymentConfirmed', '付款已確認') },
      rejected: { color: 'red', label: t('paymentRejected', '證明已拒絕') },
    }

    const config = statusConfig[existingProof.status]
    
    return (
      <div className={`bg-${config.color}-50 border border-${config.color}-200 rounded-lg p-3 mb-4`}>
        <div className="flex items-start gap-2">
          {existingProof.status === 'approved' && <Check className="w-4 h-4 text-green-600 mt-0.5" />}
          {existingProof.status === 'rejected' && <X className="w-4 h-4 text-red-600 mt-0.5" />}
          {existingProof.status === 'pending' && <Loader2 className="w-4 h-4 text-orange-600 mt-0.5 animate-spin" />}
          {existingProof.status === 'uploaded' && <FileText className="w-4 h-4 text-blue-600 mt-0.5" />}
          
          <div className="flex-1">
            <p className={`font-medium text-${config.color}-800`}>{config.label}</p>
            {existingProof.message && (
              <p className={`text-sm text-${config.color}-700 mt-1`}>說明：{existingProof.message}</p>
            )}
            {existingProof.uploadedAt && (
              <p className={`text-xs text-${config.color}-600 mt-1`}>
                上傳時間：{new Date(existingProof.uploadedAt).toLocaleString('zh-TW')}
              </p>
            )}
            {existingProof.rejectionReason && (
              <p className="text-sm text-red-700 mt-1">拒絕原因：{existingProof.rejectionReason}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const getTitle = () => {
    if (title) return title
    
    if (existingProof?.status === 'rejected') {
      return t('reuploadPaymentProof', '重新上傳轉帳證明')
    }
    if (existingProof?.hasProof) {
      return t('updatePaymentProof', '更新轉帳證明')
    }
    return t('uploadPaymentProof', '上傳轉帳證明')
  }

  const content = (
    <div className={`space-y-4 ${className}`}>
      {/* 現有證明狀態 */}
      {getStatusDisplay()}

      {/* 文件上傳區域 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${state.isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : state.error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          id={`proof-upload-${orderId}`}
        />

        {state.selectedFile ? (
          // 已選擇文件顯示
          <div className="space-y-3">
            {state.previewUrl && (
              <img
                src={state.previewUrl}
                alt="預覽"
                className="mx-auto max-w-48 max-h-32 object-contain rounded border"
              />
            )}
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-600">已選擇檔案:</p>
              <p className="font-medium">{state.selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(state.selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelectedFile}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              移除檔案
            </Button>
          </div>
        ) : (
          // 未選擇文件顯示
          <div className="space-y-3">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-600 mb-2">拖拽檔案到此處或點擊選擇</p>
              <label htmlFor={`proof-upload-${orderId}`}>
                <Button variant="outline" asChild>
                  <span>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    選擇圖片
                  </span>
                </Button>
              </label>
            </div>
            <p className="text-xs text-gray-500">支援 JPG、PNG、GIF 格式，檔案大小不超過 5MB</p>
          </div>
        )}

        {state.error && (
          <div className="flex items-center justify-center gap-2 text-red-600 mt-3">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{state.error}</span>
          </div>
        )}
      </div>

      {/* 文字說明 */}
      <div className="space-y-2">
        <Label htmlFor={`message-${orderId}`} className="text-sm font-medium">
          文字說明 <span className="text-gray-500">(可選)</span>
        </Label>
        <Textarea
          id={`message-${orderId}`}
          placeholder="您可以在此補充轉帳相關說明，例如：轉帳時間、轉帳帳戶後五碼等..."
          value={state.message}
          onChange={(e) => handleMessageChange(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-gray-500">
          例如：「已於今日下午3點從玉山銀行帳戶末五碼12345轉帳」
        </p>
      </div>

      {/* 上傳按鈕 */}
      <Button
        onClick={handleUpload}
        disabled={(!state.selectedFile && !state.message.trim()) || state.isUploading}
        className="w-full"
        size="lg"
      >
        {state.isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('uploading', '上傳中...')}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {existingProof?.hasProof ? t('updateProof', '更新證明') : t('uploadProof', '上傳證明')}
          </>
        )}
      </Button>
    </div>
  )

  if (!showCard) {
    return content
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

export default PaymentProofUpload