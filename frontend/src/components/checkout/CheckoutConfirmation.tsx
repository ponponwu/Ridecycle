import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IBicycle } from '@/types/bicycle.types'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface CheckoutConfirmationProps {
    bicycle: IBicycle
    shippingAddress: {
        fullName: string
        addressLine1: string
        city: string
        state: string
        postalCode: string
    }
    paymentMethod: {
        type: string
        last4?: string
    }
}

const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({ bicycle, shippingAddress, paymentMethod }) => {
    const { t } = useTranslation()
    const shipping = 25 // Fixed shipping cost
    const tax = bicycle.price * 0.05 // 5% tax
    const total = bicycle.price + shipping + tax

    return (
        <div className="space-y-6">
            {/* Order Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>項目</TableHead>
                                <TableHead className="text-right">金額</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">自行車價格</TableCell>
                                <TableCell className="text-right">{formatPriceNTD(bicycle.price)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>運費</TableCell>
                                <TableCell className="text-right">{formatPriceNTD(shipping)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>稅金 (5%)</TableCell>
                                <TableCell className="text-right">{formatPriceNTD(tax)}</TableCell>
                            </TableRow>
                            <TableRow className="border-t">
                                <TableCell className="font-semibold">總計</TableCell>
                                <TableCell className="text-right font-semibold">{formatPriceNTD(total)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('shippingAddress')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        <p className="font-medium">{shippingAddress.fullName}</p>
                        <p>{shippingAddress.addressLine1}</p>
                        <p>
                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('paymentMethod')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>
                        {paymentMethod.type}
                        {paymentMethod.last4 && ` ending in ${paymentMethod.last4}`}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default CheckoutConfirmation
