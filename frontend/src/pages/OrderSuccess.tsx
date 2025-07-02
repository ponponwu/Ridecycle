import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Home, Receipt, MessageCircle, Truck, HandHeart } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatPriceNTD } from '@/utils/priceFormatter'
import { IShippingInfo, IPaymentInfo, IDeliveryOption } from '@/types/checkout.types'
import { IBicycle } from '@/types/bicycle.types'

interface OrderSuccessState {
    orderId: string
    bicycle: IBicycle
    shippingInfo: IShippingInfo
    paymentInfo: IPaymentInfo
    deliveryOption: IDeliveryOption
    orderCalculation: {
        subtotal: number
        shipping: number
        tax: number
        total: number
    }
}

const OrderSuccess = () => {
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    const orderData = location.state as OrderSuccessState

    // 如果沒有訂單資料，重導到首頁
    React.useEffect(() => {
        if (!orderData) {
            navigate('/')
        }
    }, [orderData, navigate])

    if (!orderData) {
        return null // 將在 useEffect 中重導
    }

    const { orderId, bicycle, shippingInfo, paymentInfo, deliveryOption, orderCalculation } = orderData

    return (
        <MainLayout>
            <div className="container max-w-4xl px-4 py-8 mx-auto">
                {/* 成功提示 */}
                <div className="text-center mb-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-green-700 mb-2">訂單成功！</h1>
                    <p className="text-gray-600">感謝您的購買，您的訂單已成功提交並正在處理中。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 訂單資訊 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                {t('orderDetails')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">{t('orderNumber')}</p>
                                <p className="font-mono font-semibold">{orderId}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">{t('orderDate')}</p>
                                <p>{new Date().toLocaleDateString('zh-TW')}</p>
                            </div>

                            {/* 配送方式 */}
                            <div>
                                <p className="text-sm text-gray-600">{t('deliveryMethod')}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {deliveryOption.type === 'delivery' ? (
                                        <Truck className="w-4 h-4" />
                                    ) : (
                                        <HandHeart className="w-4 h-4" />
                                    )}
                                    <span className="font-medium">
                                        {deliveryOption.type === 'delivery' ? t('homeDelivery') : t('selfPickup')}
                                    </span>
                                    <Badge variant={deliveryOption.type === 'delivery' ? 'default' : 'secondary'}>
                                        {deliveryOption.cost === 0
                                            ? t('freeShipping')
                                            : formatPriceNTD(deliveryOption.cost)}
                                    </Badge>
                                </div>
                            </div>

                            {deliveryOption.type === 'delivery' && deliveryOption.estimatedDays && (
                                <div>
                                    <p className="text-sm text-gray-600">{t('staffWillContact')}</p>
                                </div>
                            )}

                            <Separator />

                            {/* 商品資訊 */}
                            <div className="flex items-start space-x-3">
                                {bicycle.photosUrls && bicycle.photosUrls.length > 0 && (
                                    <img
                                        src={bicycle.photosUrls[0]}
                                        alt={bicycle.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="font-medium">{bicycle.title}</h3>
                                    <p className="text-sm text-gray-600">{bicycle.brand?.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {t('condition')}: {bicycle.condition}
                                    </p>
                                    <p className="font-semibold mt-1">{formatPriceNTD(bicycle.price)}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* 價格摘要 */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{t('subtotal')}</span>
                                    <span>{formatPriceNTD(orderCalculation.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>{t('shippingCost')}</span>
                                    <span>{formatPriceNTD(orderCalculation.shipping)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>{t('tax')} (5%)</span>
                                    <span>{formatPriceNTD(orderCalculation.tax)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>{t('total')}</span>
                                    <span>{formatPriceNTD(orderCalculation.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 配送和付款資訊 */}
                    <div className="space-y-6">
                        {/* 配送地址 (僅在宅配時顯示) */}
                        {deliveryOption.type === 'delivery' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('shippingAddress')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <p className="font-medium">{shippingInfo.fullName}</p>
                                        <p>{shippingInfo.phoneNumber}</p>
                                        <p>
                                            {shippingInfo.county} {shippingInfo.district}
                                        </p>
                                        <p>{shippingInfo.addressLine1}</p>
                                        {shippingInfo.addressLine2 && <p>{shippingInfo.addressLine2}</p>}
                                        <p>{shippingInfo.postalCode}</p>
                                        {shippingInfo.deliveryNotes && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                {t('deliveryNotes')}: {shippingInfo.deliveryNotes}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 付款方式 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('paymentMethod')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="font-medium">{t('bankTransfer')}</p>
                                    <p className="text-sm text-gray-600">轉帳備註：{paymentInfo.transferNote}</p>
                                    {paymentInfo.accountLastFiveDigits && (
                                        <p className="text-sm text-gray-600">
                                            轉帳帳戶：*****{paymentInfo.accountLastFiveDigits}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                    <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        {t('returnToShopping')}
                    </Button>

                    <Button onClick={() => navigate('/orders')} className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        {t('viewOrders')}
                    </Button>

                    <Button onClick={() => navigate('/messages')} variant="outline" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {t('contactSeller')}
                    </Button>
                </div>

                {/* 下一步提示 */}
                <Card className="mt-8 bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-blue-900 mb-2">接下來會發生什麼？</h3>
                        {deliveryOption.type === 'delivery' ? (
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• 我們已將您的訂單資訊發送給賣家</li>
                                <li>• 賣家會在24小時內確認您的轉帳並安排出貨</li>
                                <li>• 您可以在「我的訂單」中追蹤訂單狀態</li>
                                <li>• 如有任何問題，可以透過訊息功能與賣家聯繫</li>
                            </ul>
                        ) : (
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• 我們已將您的訂單資訊發送給賣家</li>
                                <li>• 賣家會在24小時內聯絡您約定面交時間地點</li>
                                <li>• 面交驗收無誤後，款項將在7天後自動撥給賣家</li>
                                <li>• 7天內如有問題可申請退貨，超過期限不接受退貨</li>
                                <li>• 請務必透過平台進行交易，平台外交易無法提供保障</li>
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}

export default OrderSuccess
