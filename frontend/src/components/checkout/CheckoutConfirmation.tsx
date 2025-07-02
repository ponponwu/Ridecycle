import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Truck, HandHeart, MapPin, CreditCard } from 'lucide-react'
import { IBicycle } from '@/types/bicycle.types'
import { IShippingInfo, IPaymentInfo, IDeliveryOption } from '@/types/checkout.types'
import { formatPriceNTD } from '@/utils/priceFormatter'
import { calculateOrderPrices } from '@/utils/orderCalculations'

const confirmationSchema = z.object({
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: '您必須同意條款與條件',
    }),
})

interface CheckoutConfirmationProps {
    bicycle: IBicycle
    shippingInfo: IShippingInfo
    paymentInfo: IPaymentInfo
    deliveryOption: IDeliveryOption
    onBack: () => void
    onPlaceOrder: () => void
    isSubmitting: boolean
}

const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({
    bicycle,
    shippingInfo,
    paymentInfo,
    deliveryOption,
    onBack,
    onPlaceOrder,
    isSubmitting,
}) => {
    const { t } = useTranslation()

    const form = useForm({
        resolver: zodResolver(confirmationSchema),
        defaultValues: {
            agreeToTerms: false,
        },
    })

    const orderCalculation = calculateOrderPrices(bicycle, deliveryOption.cost)

    const handleSubmit = () => {
        if (form.getValues('agreeToTerms')) {
            onPlaceOrder()
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">{t('orderConfirmation')}</h2>

            {/* 商品詳情 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('bicycleDetails')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start space-x-4">
                        {bicycle.photosUrls && bicycle.photosUrls.length > 0 && (
                            <img
                                src={bicycle.photosUrls[0]}
                                alt={bicycle.title}
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold">{bicycle.title}</h3>
                            <p className="text-sm text-gray-600">{bicycle.brand?.name}</p>
                            <p className="text-sm text-gray-600">
                                {t('condition')}: {t(`conditions.${bicycle.condition}`, bicycle.condition)}
                            </p>
                            {bicycle.frameSize && (
                                <p className="text-sm text-gray-600">
                                    {t('frameSize')}: {bicycle.frameSize}
                                </p>
                            )}
                            {bicycle.seller && (
                                <p className="text-sm text-gray-600">
                                    {t('seller')}: {bicycle.seller.full_name || bicycle.seller.name}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">{t('unitPrice')}</p>
                            <p className="font-semibold">{formatPriceNTD(bicycle.price)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 配送方式 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {deliveryOption.type === 'delivery' ? (
                            <Truck className="w-5 h-5" />
                        ) : (
                            <HandHeart className="w-5 h-5" />
                        )}
                        {t('deliveryMethod')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">
                                {deliveryOption.type === 'delivery' ? t('homeDelivery') : t('selfPickup')}
                            </span>
                            <Badge variant={deliveryOption.type === 'delivery' ? 'default' : 'secondary'}>
                                {deliveryOption.type === 'delivery' ? t('distanceBasedShipping') : t('freeShipping')}
                            </Badge>
                        </div>

                        {deliveryOption.type === 'delivery' && (
                            <p className="text-sm text-gray-600">
                                {t('staffWillContact')}
                            </p>
                        )}

                        {deliveryOption.type === 'pickup' && (
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>• 賣家會與您聯繫約定面交時間地點</p>
                                <p>• 款項由平台保管，驗收完成後7天後撥款</p>
                                <p>• 7天內可申請退貨退款</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 配送地址 */}
            {deliveryOption.type === 'delivery' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            {t('deliveryAddress')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="font-medium">{shippingInfo.fullName}</p>
                            <p>{shippingInfo.phoneNumber}</p>
                            <p>
                                {shippingInfo.city} {shippingInfo.district}
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
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {t('paymentMethod')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="font-medium">{t('bankTransfer')}</p>
                        <p className="text-sm text-gray-600">{t('paymentMethodNote')}</p>
                        <p className="text-sm text-gray-600">轉帳備註：{paymentInfo.transferNote}</p>
                        {paymentInfo.accountLastFiveDigits && (
                            <p className="text-sm text-gray-600">轉帳帳戶：*****{paymentInfo.accountLastFiveDigits}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 價格摘要 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between">
                        <span>{t('subtotal')}</span>
                        <span>{formatPriceNTD(orderCalculation.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t('shippingCost')}</span>
                        <span>{formatPriceNTD(orderCalculation.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t('tax')} (5%)</span>
                        <span>{formatPriceNTD(orderCalculation.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                        <span>{t('total')}</span>
                        <span>{formatPriceNTD(orderCalculation.total)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* 條款同意 */}
            <Form {...form}>
                <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm">
                                    {t('agreeToTerms')} {t('termsAndConditions')} {t('and')} {t('privacyPolicy')}
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />
            </Form>

            {/* 操作按鈕 */}
            <div className="flex justify-between space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                    {t('previous')}
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!form.watch('agreeToTerms') || isSubmitting}
                    className="min-w-32"
                >
                    {isSubmitting ? t('submitting') : t('placeOrder')}
                </Button>
            </div>
        </div>
    )
}

export default CheckoutConfirmation
