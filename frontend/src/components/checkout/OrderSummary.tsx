import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Truck, HandHeart } from 'lucide-react'
import { IBicycle } from '@/types/bicycle.types'
import { IDeliveryOption } from '@/types/checkout.types'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface OrderSummaryProps {
    bicycle: IBicycle
    shipping?: number
    tax?: number
    deliveryOption?: IDeliveryOption
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ bicycle, shipping = 100, tax, deliveryOption }) => {
    const { t } = useTranslation()

    // 判斷是否真正選擇了配送方式
    const hasSelectedDeliveryMethod = deliveryOption && (
        (deliveryOption.type === 'delivery' && (deliveryOption.cost > 0 || deliveryOption.estimatedDays)) ||
        (deliveryOption.type === 'pickup')
    )

    // 計算稅金（如果沒有提供，默認為5%）
    const calculatedTax = tax ?? bicycle.price * 0.05
    const actualShipping = hasSelectedDeliveryMethod ? (deliveryOption?.cost ?? 0) : 0
    const total = bicycle.price + actualShipping + calculatedTax

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle className="text-lg">{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 商品資訊 */}
                <div className="flex items-start space-x-3">
                    {bicycle.photosUrls && bicycle.photosUrls.length > 0 && (
                        <img
                            src={bicycle.photosUrls[0]}
                            alt={bicycle.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-tight">{bicycle.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{bicycle.brand?.name}</p>
                        <p className="text-xs text-gray-600">
                            {t('condition')}: {t(`conditions.${bicycle.condition}`, bicycle.condition)}
                        </p>
                        {bicycle.frameSize && (
                            <p className="text-xs text-gray-600">
                                {t('frameSize')}: {bicycle.frameSize}
                            </p>
                        )}
                    </div>
                </div>

                <Separator />

                {/* 配送方式資訊 */}
                {hasSelectedDeliveryMethod && (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {deliveryOption.type === 'delivery' ? (
                                        <Truck className="w-4 h-4" />
                                    ) : (
                                        <HandHeart className="w-4 h-4" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {deliveryOption.type === 'delivery' ? t('homeDelivery') : t('selfPickup')}
                                    </span>
                                </div>
                                <Badge variant={deliveryOption.type === 'delivery' ? 'default' : 'secondary'}>
                                    {deliveryOption.cost === 0
                                        ? t('freeShipping')
                                        : formatPriceNTD(deliveryOption.cost)}
                                </Badge>
                            </div>

                            {deliveryOption.type === 'delivery' && (
                                <p className="text-xs text-gray-500">
                                    {t('staffWillContact')}
                                </p>
                            )}

                            {deliveryOption.type === 'pickup' && (
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>• 與賣家約定面交時間地點</p>
                                    <p>• 驗收後7天內可申請退貨</p>
                                </div>
                            )}
                        </div>

                        <Separator />
                    </>
                )}

                {/* 價格明細 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>{t('subtotal')}</span>
                        <span>{formatPriceNTD(bicycle.price)}</span>
                    </div>

                    {hasSelectedDeliveryMethod && (
                        <div className="flex justify-between text-sm">
                            <span>{t('shippingCost')}</span>
                            <span>{formatPriceNTD(actualShipping)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-sm">
                        <span>{t('tax')} (5%)</span>
                        <span>{formatPriceNTD(calculatedTax)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold text-base">
                        <span>{t('total')}</span>
                        <span>{formatPriceNTD(total)}</span>
                    </div>
                </div>

                {/* 額外資訊 */}
                {hasSelectedDeliveryMethod && deliveryOption?.type === 'delivery' && (
                    <div className="text-xs text-gray-500 space-y-1 pt-2">
                        <p>• {t('staffWillContact')}</p>
                        <p>• 免費退貨 7 天內</p>
                        <p>• 商品保固 30 天</p>
                    </div>
                )}

                {hasSelectedDeliveryMethod && deliveryOption?.type === 'pickup' && (
                    <div className="text-xs text-gray-500 space-y-1 pt-2">
                        <p>• 面交驗收完成後7天內可退貨</p>
                        <p>• 款項由平台暫時保管</p>
                        <p>• 驗收無誤後7天後撥款給賣家</p>
                    </div>
                )}

                {/* 賣家資訊 */}
                {bicycle.seller && (
                    <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600 mb-1">{t('seller')}</p>
                        <div className="flex items-center space-x-2">
                            {bicycle.seller.avatar_url && (
                                <img
                                    src={bicycle.seller.avatar_url}
                                    alt={bicycle.seller.name}
                                    className="w-6 h-6 rounded-full"
                                />
                            )}
                            <span className="text-sm font-medium">
                                {bicycle.seller.full_name || bicycle.seller.name}
                            </span>
                        </div>
                        {bicycle.location && (
                            <p className="text-xs text-gray-500 mt-1">
                                {t('location')}: {bicycle.location}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default OrderSummary
