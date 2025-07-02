import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, AlertCircle, Check } from 'lucide-react'
import { orderService } from '@/api/services/order.service'
import { IOrder } from '@/types/order.types'
import { useToast } from '@/components/ui/use-toast'
import BankAccountInfo from '@/components/payment/BankAccountInfo'
import PaymentProofUpload from '@/components/payment/PaymentProofUpload'
import type { PaymentProofInfo } from '@/types/payment.types'

const OrderPayment: React.FC = () => {
    const { orderNumber } = useParams<{ orderNumber: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { toast } = useToast()

    const [order, setOrder] = useState<IOrder | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [paymentProofInfo, setPaymentProofInfo] = useState<PaymentProofInfo | undefined>(undefined)

    useEffect(() => {
        if (orderNumber) {
            loadOrder(orderNumber)
        }
    }, [orderNumber])

    const loadOrder = async (orderId: string) => {
        try {
            setIsLoading(true)
            setError(null)
            const orderData = await orderService.getOrderById(orderId)
            setOrder(orderData as IOrder)

            // 設置付款證明資訊（只有在真正有付款證明時才設置）
            if (orderData.paymentProofInfo && orderData.paymentProofInfo.hasProof) {
                const adaptedProofInfo: PaymentProofInfo = {
                    id: `proof_${orderData.id}`,
                    hasProof: orderData.paymentProofInfo.hasProof,
                    status:
                        orderData.paymentProofInfo.status === 'none' ? 'pending' : orderData.paymentProofInfo.status,
                    uploadedAt: orderData.paymentProofInfo.uploadedAt,
                    fileName: orderData.paymentProofInfo.filename,
                    fileSize: orderData.paymentProofInfo.fileSize,
                }
                setPaymentProofInfo(adaptedProofInfo)
            } else {
                // 確保沒有付款證明時將狀態設為 undefined
                setPaymentProofInfo(undefined)
            }
        } catch (error) {
            console.error('Failed to load order:', error)
            setError(error instanceof Error ? error.message : '載入訂單失敗')
        } finally {
            setIsLoading(false)
        }
    }

    // 處理付款證明上傳成功
    const handlePaymentProofUploadSuccess = (proofInfo: PaymentProofInfo) => {
        setPaymentProofInfo(proofInfo)
        toast({
            title: t('uploadSuccessTitle', '上傳成功'),
            description: t('uploadSuccessMessage', '轉帳證明已上傳，請等待確認'),
        })
        // 返回訂單詳情頁面
        navigate(`/orders/${order?.id}`)
    }

    // 處理付款證明上傳失敗
    const handlePaymentProofUploadError = (error: string) => {
        console.error('Payment proof upload error:', error)
    }

    // 將英文時間字串轉換為中文
    const formatRemainingTime = (timeString: string) => {
        if (!timeString) return ''

        // 解析英文時間字串，例如 "2 days remaining", "1 hour remaining", etc.
        const match = timeString.match(/(\d+)\s+(day|hour|minute)s?\s+remaining/i)
        if (match) {
            const [, number, unit] = match
            const unitTranslations: { [key: string]: string } = {
                day: number === '1' ? '天' : '天',
                hour: number === '1' ? '小時' : '小時',
                minute: number === '1' ? '分鐘' : '分鐘',
            }
            return `${number} ${unitTranslations[unit.toLowerCase()] || unit}`
        }

        // 如果解析失敗，返回原字串
        return timeString
    }

    if (isLoading) {
        return (
            <MainLayout>
                <div className="container max-w-4xl mx-auto px-4 py-8">
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="ml-2">{t('loadingText')}</span>
                    </div>
                </div>
            </MainLayout>
        )
    }

    if (error || !order) {
        return (
            <MainLayout>
                <div className="container max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-4">{error || t('orderNotFoundMessage')}</div>
                        <div className="space-x-4">
                            <Button onClick={() => navigate(-1)} variant="outline">
                                {t('goBackBtn')}
                            </Button>
                            <Button onClick={() => orderNumber && loadOrder(orderNumber)}>{t('tryAgainBtn')}</Button>
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }

    // 如果訂單已付款或已確認，重導向到訂單詳情
    if (order.paymentStatus === 'paid') {
        navigate(`/orders/${order.id}`, { replace: true })
        return null
    }

    // 如果已上傳付款證明，顯示審核中狀態
    const hasUploadedProof = paymentProofInfo?.hasProof

    // 如果訂單已過期，顯示過期提示
    if (order.expired) {
        return (
            <MainLayout>
                <div className="container max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-4">訂單已過期</h2>
                        <p className="text-gray-600 mb-6">此訂單的付款期限已過，無法繼續付款。</p>
                        <Button onClick={() => navigate('/orders')} variant="outline">
                            返回訂單列表
                        </Button>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="container max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('returnToOrderDetails')}
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{t('completePayment')}</h1>
                        <p className="text-gray-500">
                            {t('orderNumberLabel')}: {order.orderNumber || order.id}
                        </p>
                    </div>
                </div>

                {/* Payment Status Information */}
                {hasUploadedProof ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-800 mb-1">
                                    {order.paymentProofInfo?.status === 'approved'
                                        ? t('paymentConfirmed')
                                        : order.paymentProofInfo?.status === 'rejected'
                                        ? t('paymentRejected')
                                        : order.paymentStatus === 'awaiting_confirmation'
                                        ? t('paymentPending')
                                        : t('proofUploaded')}
                                </h4>
                                <p className="text-sm text-blue-700">
                                    {order.paymentProofInfo?.status === 'approved'
                                        ? t('paymentConfirmedDesc')
                                        : order.paymentProofInfo?.status === 'rejected'
                                        ? t('paymentRejectedDesc')
                                        : order.paymentStatus === 'awaiting_confirmation'
                                        ? t('paymentPendingDesc')
                                        : t('proofUploadedDesc')}
                                </p>
                                {order.paymentProofInfo?.uploadedAt && (
                                    <p className="text-xs text-blue-600 mt-2">
                                        上傳時間：{new Date(order.paymentProofInfo.uploadedAt).toLocaleString('zh-TW')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-orange-800 mb-1">請於期限內完成付款</h4>
                                <p className="text-sm text-orange-700">
                                    {order.remainingPaymentTimeHumanized &&
                                        `${t('remainingTime')}: ${formatRemainingTime(
                                            order.remainingPaymentTimeHumanized
                                        )}`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Bank Transfer Information */}
                    <BankAccountInfo
                        amount={order.totalPrice}
                        transferNote={order.orderNumber || order.id}
                        mode="full"
                    />

                    {/* Payment Proof Upload */}
                    <PaymentProofUpload
                        orderId={order.id}
                        existingProof={paymentProofInfo}
                        onUploadSuccess={handlePaymentProofUploadSuccess}
                        onUploadError={handlePaymentProofUploadError}
                    />
                </div>

                {/* Instructions */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>轉帳注意事項</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                            <li>請確認轉帳金額與訂單金額完全相符</li>
                            <li>轉帳備註請填入訂單編號，以便快速核對</li>
                            <li>上傳轉帳證明後，我們將在 24 小時內確認</li>
                            <li>確認轉帳後將立即安排出貨</li>
                            <li>如有任何問題，請聯繫客服</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}

export default OrderPayment
