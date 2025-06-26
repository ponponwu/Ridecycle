import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Truck, HandHeart, Clock, Shield, AlertTriangle } from 'lucide-react'
import { IDeliveryOption } from '@/types/checkout.types'
import { formatPriceNTD } from '@/utils/priceFormatter'
import { calculateShippingCost, calculateDeliveryTime } from '@/utils/orderCalculations'

interface DeliveryOptionsFormProps {
    selectedOption: IDeliveryOption
    onOptionChange: (option: IDeliveryOption) => void
    county: string
    bicycleWeight?: number
}

const DeliveryOptionsForm: React.FC<DeliveryOptionsFormProps> = ({
    selectedOption,
    onOptionChange,
    county,
    bicycleWeight,
}) => {
    const { t } = useTranslation()

    // 計算配送運費和時間
    const deliveryCost = county ? calculateShippingCost(county, bicycleWeight) : 100
    const deliveryTime = county ? calculateDeliveryTime(county) : { min: 3, max: 5 }

    const deliveryOptions: IDeliveryOption[] = [
        {
            type: 'delivery',
            cost: deliveryCost,
            estimatedDays: deliveryTime,
            note: t('estimatedDeliveryTime'),
        },
        {
            type: 'pickup',
            cost: 0,
            note: t('pickupInstructions'),
        },
    ]

    const handleOptionSelect = (value: string) => {
        const option = deliveryOptions.find((opt) => opt.type === value)
        if (option) {
            onOptionChange(option)
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('deliveryOptions')}</h3>

            <RadioGroup value={selectedOption.type} onValueChange={handleOptionSelect} className="space-y-4">
                {/* 宅配到府選項 */}
                <Card
                    className={`cursor-pointer transition-colors ${
                        selectedOption.type === 'delivery' ? 'ring-2 ring-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                >
                    <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                            <div className="flex-1">
                                <Label
                                    htmlFor="delivery"
                                    className="flex items-center gap-2 font-medium cursor-pointer"
                                >
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    {t('homeDelivery')}
                                </Label>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{t('deliveryFee')}</span>
                                        <span className="font-medium text-blue-600">
                                            {formatPriceNTD(deliveryCost)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                            {deliveryTime.min}-{deliveryTime.max} {t('businessDays')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 自行面交選項 */}
                <Card
                    className={`cursor-pointer transition-colors ${
                        selectedOption.type === 'pickup' ? 'ring-2 ring-green-600 bg-green-50' : 'hover:bg-gray-50'
                    }`}
                >
                    <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                            <div className="flex-1">
                                <Label htmlFor="pickup" className="flex items-center gap-2 font-medium cursor-pointer">
                                    <HandHeart className="w-5 h-5 text-green-600" />
                                    {t('selfPickup')}
                                </Label>
                                <div className="mt-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{t('deliveryFee')}</span>
                                        <span className="font-medium text-green-600">{t('freeShipping')}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{t('pickupInstructions')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </RadioGroup>

            {/* 面交付款流程說明 */}
            {selectedOption.type === 'pickup' && (
                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <Shield className="w-5 h-5" />
                            {t('pickupPaymentFlow')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            {Object.values(
                                t('pickupPaymentSteps', { returnObjects: true }) as Record<string, string>
                            ).map((step, index) => (
                                <p key={index} className="text-sm text-green-800">
                                    {step}
                                </p>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-green-200">
                            <p className="text-sm text-green-700 mb-2">{t('pickupRefundPolicy')}</p>
                        </div>

                        {/* 警告提示 */}
                        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-800">{t('pickupWarning')}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default DeliveryOptionsForm
