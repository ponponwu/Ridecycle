import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
    Check, 
    X, 
    FileImage, 
    Download, 
    Calendar, 
    User, 
    Package,
    CreditCard,
    AlertCircle,
    Loader2
} from 'lucide-react'
import { IAdminOrder } from '@/services/admin.service'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface PaymentProofReviewProps {
    order: IAdminOrder
    onApprove: (notes?: string) => Promise<void>
    onReject: (reason: string, notes?: string) => Promise<void>
    onClose: () => void
}

const PaymentProofReview: React.FC<PaymentProofReviewProps> = ({
    order,
    onApprove,
    onReject,
    onClose
}) => {
    const { t, i18n } = useTranslation()
    const isChinese = i18n.language === 'zh'

    const [notes, setNotes] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showRejectForm, setShowRejectForm] = useState(false)

    const handleApprove = async () => {
        try {
            setIsSubmitting(true)
            await onApprove(notes)
        } catch (error) {
            console.error('Failed to approve payment proof:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            return
        }
        
        try {
            setIsSubmitting(true)
            await onReject(rejectReason, notes)
        } catch (error) {
            console.error('Failed to reject payment proof:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const proofInfo = order.paymentProofInfo

    if (!proofInfo || !proofInfo.hasProof) {
        return null
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileImage className="w-5 h-5" />
                        {isChinese ? '付款證明審核' : 'Payment Proof Review'}
                    </DialogTitle>
                    <DialogDescription>
                        {isChinese ? 
                            '請仔細檢查付款證明並決定是否核准' : 
                            'Please carefully review the payment proof and decide whether to approve'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* 左側：訂單資訊 */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    {isChinese ? '訂單資訊' : 'Order Information'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{isChinese ? '訂單編號' : 'Order Number'}:</span>
                                    <span className="font-medium">#{order.orderNumber || order.id}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{isChinese ? '訂單金額' : 'Order Amount'}:</span>
                                    <span className="font-bold text-green-600">{formatPriceNTD(order.totalPrice)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">{isChinese ? '建立時間' : 'Created'}:</span>
                                    <span>{new Date(order.createdAt).toLocaleString('zh-TW')}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">{isChinese ? '付款狀態' : 'Payment Status'}:</span>
                                    <Badge className={
                                        order.paymentStatus === 'awaiting_confirmation' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }>
                                        {order.paymentStatus === 'awaiting_confirmation' 
                                            ? (isChinese ? '待確認' : 'Awaiting Confirmation')
                                            : (isChinese ? '待付款' : 'Pending Payment')
                                        }
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    {isChinese ? '買家資訊' : 'Buyer Information'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{isChinese ? '姓名' : 'Name'}:</span>
                                    <span className="font-medium">{order.buyer?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{isChinese ? '信箱' : 'Email'}:</span>
                                    <span>{order.buyer?.email}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    {isChinese ? '商品資訊' : 'Product Information'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-3">
                                    {order.bicycle?.mainPhotoUrl && (
                                        <img
                                            src={order.bicycle.mainPhotoUrl}
                                            alt={order.bicycle.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-medium">{order.bicycle?.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {order.bicycle?.brand} {order.bicycle?.model}
                                        </p>
                                        <p className="text-lg font-bold text-green-600 mt-1">
                                            {formatPriceNTD(order.bicycle?.price || order.totalPrice)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 右側：付款證明 */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    {isChinese ? '付款證明' : 'Payment Proof'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* 證明檔案資訊 */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{isChinese ? '檔案名稱' : 'File Name'}:</span>
                                        <span className="font-medium">{proofInfo.filename}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{isChinese ? '上傳時間' : 'Upload Time'}:</span>
                                        <span>
                                            {proofInfo.uploadedAt && 
                                                new Date(proofInfo.uploadedAt).toLocaleString('zh-TW')
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{isChinese ? '檔案大小' : 'File Size'}:</span>
                                        <span>
                                            {proofInfo.fileSize && 
                                                `${(proofInfo.fileSize / 1024 / 1024).toFixed(2)} MB`
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{isChinese ? '檔案格式' : 'File Type'}:</span>
                                        <span>{proofInfo.contentType}</span>
                                    </div>
                                </div>

                                {/* 圖片預覽 */}
                                {proofInfo.proofUrl && (
                                    <div className="space-y-2">
                                        <Label>{isChinese ? '圖片預覽' : 'Image Preview'}</Label>
                                        <div className="border rounded-lg overflow-hidden">
                                            <img
                                                src={proofInfo.proofUrl}
                                                alt="Payment Proof"
                                                className="w-full h-auto max-h-96 object-contain"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Download className="w-4 h-4 mr-2" />
                                            {isChinese ? '下載原圖' : 'Download Original'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 審核表單 */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {isChinese ? '審核決定' : 'Review Decision'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!showRejectForm ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">{isChinese ? '審核備註（選填）' : 'Review Notes (Optional)'}</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder={isChinese ? 
                                            '輸入審核備註...' : 
                                            'Enter review notes...'
                                        }
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4 mr-2" />
                                        )}
                                        {isChinese ? '核准付款' : 'Approve Payment'}
                                    </Button>
                                    
                                    <Button
                                        onClick={() => setShowRejectForm(true)}
                                        disabled={isSubmitting}
                                        variant="destructive"
                                        className="flex-1"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        {isChinese ? '拒絕付款' : 'Reject Payment'}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-red-800 mb-1">
                                                {isChinese ? '拒絕付款證明' : 'Reject Payment Proof'}
                                            </h4>
                                            <p className="text-sm text-red-700">
                                                {isChinese ? 
                                                    '請提供拒絕原因，這將會通知買家' : 
                                                    'Please provide a reason for rejection, this will notify the buyer'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rejectReason">
                                        {isChinese ? '拒絕原因' : 'Rejection Reason'} *
                                    </Label>
                                    <Textarea
                                        id="rejectReason"
                                        placeholder={isChinese ? 
                                            '請詳細說明拒絕原因...' : 
                                            'Please provide detailed reason for rejection...'
                                        }
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="additionalNotes">
                                        {isChinese ? '額外備註（選填）' : 'Additional Notes (Optional)'}
                                    </Label>
                                    <Textarea
                                        id="additionalNotes"
                                        placeholder={isChinese ? 
                                            '輸入額外備註...' : 
                                            'Enter additional notes...'
                                        }
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowRejectForm(false)}
                                        variant="outline"
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        {isChinese ? '取消' : 'Cancel'}
                                    </Button>
                                    
                                    <Button
                                        onClick={handleReject}
                                        disabled={isSubmitting || !rejectReason.trim()}
                                        variant="destructive"
                                        className="flex-1"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <X className="w-4 h-4 mr-2" />
                                        )}
                                        {isChinese ? '確認拒絕' : 'Confirm Rejection'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <DialogFooter>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        disabled={isSubmitting}
                    >
                        {isChinese ? '關閉' : 'Close'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default PaymentProofReview