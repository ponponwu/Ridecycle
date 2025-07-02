import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Check, Loader2, AlertCircle, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { orderService } from '@/api/services/order.service'
import { IOrder } from '@/types/order.types'
import { formatPriceNTD } from '@/utils/priceFormatter'
import BankAccountInfo from '@/components/payment/BankAccountInfo'
import PaymentProofUpload from '@/components/payment/PaymentProofUpload'
import type { PaymentProofInfo } from '@/types/payment.types'

const OrderDetail: React.FC = () => {
    const { orderNumber } = useParams<{ orderNumber: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation()

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
            setOrder(orderData)
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
        // 重新載入訂單以獲取最新狀態
        if (orderNumber) {
            loadOrder(orderNumber)
        }
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

    // 獲取付款期限倒數時間
    const getPaymentDeadlineDisplay = () => {
        if (!order || order.paymentStatus === 'paid' || order.expired) return null

        if (order.remainingPaymentTimeHumanized) {
            const formattedTime = formatRemainingTime(order.remainingPaymentTimeHumanized)
            return (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                            {t('paymentDeadlineCountdown')}: {formattedTime}
                        </span>
                    </div>
                </div>
            )
        }

        return null
    }

    const renderStatusBadge = (status: string) => {
        let color = ''
        let label = ''

        switch (status) {
            case 'pending':
                color = 'bg-yellow-100 text-yellow-800'
                label = t('orders.status.pending')
                break
            case 'processing':
                color = 'bg-blue-100 text-blue-800'
                label = t('orders.status.processing')
                break
            case 'shipped':
                color = 'bg-purple-100 text-purple-800'
                label = t('orders.status.shipped')
                break
            case 'delivered':
                color = 'bg-green-100 text-green-800'
                label = t('orders.status.delivered')
                break
            case 'completed':
                color = 'bg-emerald-100 text-emerald-800'
                label = t('orders.status.completed')
                break
            case 'cancelled':
                color = 'bg-red-100 text-red-800'
                label = t('orders.status.cancelled')
                break
            default:
                color = 'bg-gray-100 text-gray-800'
                label = status
        }

        return <Badge className={`${color} border-0`}>{label}</Badge>
    }

    const getProgressSteps = (status: string) => {
        const steps = [
            { key: 'processing', label: '處理中', icon: Package },
            { key: 'shipped', label: '已出貨', icon: Truck },
            { key: 'delivered', label: '已送達', icon: Check },
        ]

        const statusOrder = ['processing', 'shipped', 'delivered', 'completed']
        const currentIndex = statusOrder.indexOf(status)

        return steps.map((step, index) => ({
            ...step,
            isCompleted: index <= currentIndex,
            isCurrent: index === currentIndex && status !== 'completed',
        }))
    }

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
            </MainLayout>
        )
    }

    if (error || !order) {
        return (
            <MainLayout>
                <div className="container max-w-4xl px-4 py-16 mx-auto text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h1 className="mb-4 text-2xl font-bold">無法載入訂單</h1>
                    <p className="mb-8 text-gray-600">{error || '找不到您要查看的訂單資訊。'}</p>
                    <Button onClick={() => navigate('/profile')}>返回個人資料</Button>
                </div>
            </MainLayout>
        )
    }

    const progressSteps = getProgressSteps(order.status)

    return (
        <MainLayout>
            <div className="container max-w-6xl px-4 py-8 mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">訂單詳情</h1>
                            <p className="text-gray-600">訂單編號: #{order.orderNumber || order.id}</p>
                        </div>
                    </div>
                    {renderStatusBadge(order.status)}
                </div>

                {/* Order Progress */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">訂單進度</h2>
                    <div className="flex items-center justify-between relative">
                        {progressSteps.map((step, index) => {
                            const Icon = step.icon
                            return (
                                <div key={step.key} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center z-10">
                                        <div
                                            className={`flex items-center justify-center w-12 h-12 rounded-full ${
                                                step.isCompleted
                                                    ? 'bg-green-600 text-white'
                                                    : step.isCurrent
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-400'
                                            }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <p
                                            className={`mt-2 text-sm text-center ${
                                                step.isCompleted || step.isCurrent
                                                    ? 'text-gray-900 font-medium'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            {step.label}
                                        </p>
                                    </div>
                                    {index < progressSteps.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 ${
                                                step.isCompleted ? 'bg-green-600' : 'bg-gray-200'
                                            }`}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-blue-600" />
                                訂購商品
                            </h2>
                            {order.bicycle && (
                                <div className="flex items-center space-x-4 p-4 border rounded-md">
                                    <img
                                        src={order.bicycle.mainPhotoUrl}
                                        alt={order.bicycle.title}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{order.bicycle.title}</h3>
                                        <p className="text-gray-600">
                                            {order.bicycle.brand} {order.bicycle.model}
                                        </p>
                                        <p className="text-sm text-gray-500">狀態: {order.bicycle.status}</p>
                                        <p className="text-xl font-bold text-blue-600 mt-2">
                                            {formatPriceNTD(order.totalPrice)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">訂單摘要</h2>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">商品價格</TableCell>
                                        <TableCell className="text-right">
                                            {formatPriceNTD(order.subtotal || order.totalPrice)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">運費</TableCell>
                                        <TableCell className="text-right">
                                            {formatPriceNTD(order.shippingCost)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-t-2">
                                        <TableCell className="font-bold text-lg">總計</TableCell>
                                        <TableCell className="font-bold text-lg text-blue-600 text-right">
                                            {formatPriceNTD(order.totalPrice)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Right Column - Addresses & Payment */}
                    <div className="space-y-6">
                        {/* Order Details */}
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">訂單資訊</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">訂單日期:</span>
                                    <span>{new Date(order.createdAt).toLocaleDateString('zh-TW')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">訂單狀態:</span>
                                    <span>{renderStatusBadge(order.status)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Seller Info */}
                        {order.seller && (
                            <div className="p-6 bg-white rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                    賣家資訊
                                </h2>
                                <div className="text-sm space-y-1">
                                    <p className="font-medium">{order.seller.fullName || order.seller.name}</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Method and Bank Info */}
                        <div className="space-y-4">
                            {/* Payment Status */}
                            <div className="p-6 bg-white rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                                    付款資訊
                                </h2>
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">付款方式:</span>
                                        <span>{t(`orders.paymentMethods.${order.paymentMethod}`)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">付款狀態:</span>
                                        <span>{t(`orders.paymentStatus.${order.paymentStatus}`)}</span>
                                    </div>
                                </div>
                                <div className="text-sm space-y-2 pt-4">
                                    {/* Payment Deadline */}
                                    {getPaymentDeadlineDisplay()}
                                </div>
                            </div>

                            {/* Bank Account Information (show when payment is needed) */}
                            {(order.paymentStatus === 'pending' || order.paymentStatus === 'awaiting_confirmation') &&
                                !order.expired && (
                                    <BankAccountInfo
                                        amount={order.totalPrice}
                                        transferNote={order.orderNumber || order.id}
                                        mode="compact"
                                        title="轉帳資訊"
                                    />
                                )}

                            {/* Payment Proof Upload (show when payment is needed or proof can be updated) */}
                            {(order.paymentStatus === 'pending' || order.paymentStatus === 'awaiting_confirmation') &&
                                !order.expired && (
                                    <PaymentProofUpload
                                        orderId={order.id}
                                        existingProof={paymentProofInfo}
                                        onUploadSuccess={handlePaymentProofUploadSuccess}
                                        onUploadError={handlePaymentProofUploadError}
                                    />
                                )}
                        </div>

                        {/* Action Buttons */}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default OrderDetail
