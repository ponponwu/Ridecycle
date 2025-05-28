import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IBicycle } from '@/types/bicycle.types'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface OrderSummaryProps {
    bicycle: IBicycle
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ bicycle }) => {
    const { t } = useTranslation()
    const shipping = 25 // Fixed shipping cost
    const tax = bicycle.price * 0.05 // 5% tax
    const total = bicycle.price + shipping + tax

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Bicycle Info */}
                <div className="flex items-center space-x-4 pb-4 border-b">
                    <img
                        src={bicycle.photosUrls?.[0] || '/placeholder-bike.jpg'}
                        alt={bicycle.title}
                        className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                        <h4 className="font-medium">{bicycle.title}</h4>
                        <p className="text-sm text-gray-600">{bicycle.brand?.name}</p>
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>{t('subtotal')}</span>
                        <span>{formatPriceNTD(bicycle.price)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>運費</span>
                        <span>{formatPriceNTD(shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t('tax')}</span>
                        <span>{formatPriceNTD(tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>{t('total')}</span>
                        <span>{formatPriceNTD(total)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default OrderSummary
