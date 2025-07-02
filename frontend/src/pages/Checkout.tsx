import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import CheckoutStepper from '@/components/checkout/CheckoutStepper'
import ShippingAddressForm from '@/components/checkout/ShippingAddressForm'
import DeliveryOptionsForm from '@/components/checkout/DeliveryOptionsForm'
import OrderSummary from '@/components/checkout/OrderSummary'
import CheckoutConfirmation from '@/components/checkout/CheckoutConfirmation'
import BankAccountInfo from '@/components/payment/BankAccountInfo'
import { IShippingInfo, IPaymentInfo, IDeliveryOption } from '@/types/checkout.types'
import { orderService } from '@/api/services/order.service'
import { calculateShippingCost, validateOrderData, calculateOrderPrices } from '@/utils/orderCalculations'

const Checkout = () => {
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    const { bicycle } = location.state || {}
    const [currentStep, setCurrentStep] = useState(0)
    const [shippingInfo, setShippingInfo] = useState<IShippingInfo>({} as IShippingInfo)
    const [deliveryOption, setDeliveryOption] = useState<IDeliveryOption>({
        type: 'delivery',
        cost: 0,
    })
    const [paymentInfo] = useState<IPaymentInfo>({} as IPaymentInfo)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [orderError, setOrderError] = useState<string | null>(null)
    const [createdOrder, setCreatedOrder] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

    // If no bicycle data is passed, redirect to home
    React.useEffect(() => {
        if (!bicycle) {
            navigate('/')
        }
    }, [bicycle, navigate])

    const steps = [
        t('stepTitles.shippingAddress'),
        t('deliveryOptions'),
        t('stepTitles.orderReview'),
        t('stepTitles.paymentInfo'),
    ]

    // 計算總價
    const orderCalculation = React.useMemo(() => {
        if (bicycle) {
            return calculateOrderPrices(bicycle, deliveryOption.cost)
        }
        return { subtotal: 0, shipping: 0, tax: 0, total: 0 }
    }, [bicycle, deliveryOption.cost])

    const handleNextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }

    const handlePrevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    const goToStep = (stepIndex: number) => {
        if (stepIndex < currentStep) {
            setCurrentStep(stepIndex)
        }
    }

    const handleShippingSubmit = (data: IShippingInfo) => {
        setShippingInfo(data)

        // 更新配送選項的運費
        if (data.city && bicycle?.weight) {
            const newShippingCost = calculateShippingCost(data.city, bicycle.weight)
            setDeliveryOption((prev) => ({
                ...prev,
                cost: prev.type === 'delivery' ? newShippingCost : 0,
            }))
        }

        handleNextStep()
    }

    const handleDeliveryOptionChange = (option: IDeliveryOption) => {
        setDeliveryOption(option)
    }

    const handleDeliverySubmit = () => {
        handleNextStep()
    }

    const handleOrderReview = async () => {
        setIsSubmitting(true)
        setOrderError(null)

        try {
            // 驗證訂單資料
            if (!validateOrderData(bicycle, shippingInfo, paymentInfo)) {
                throw new Error('訂單資料不完整')
            }

            // 構建完整的訂單創建資料，符合後端 API 格式
            const orderRequestData = {
                order: {
                    bicycle_id: bicycle.id,
                    total_price: orderCalculation.total,
                    payment_method: 'bank_transfer',
                    shipping_method: deliveryOption.type === 'pickup' ? 'self_pickup' : 'assisted_delivery',
                    shipping_distance: deliveryOption.type === 'delivery' ? 5 : 0,
                    shipping_address: {
                        full_name: shippingInfo.fullName,
                        phone_number: shippingInfo.phoneNumber,
                        city: shippingInfo.city,
                        district: shippingInfo.district,
                        address_line1: shippingInfo.addressLine1,
                        address_line2: shippingInfo.addressLine2 || '',
                        postal_code: shippingInfo.postalCode,
                        delivery_notes: shippingInfo.deliveryNotes || '',
                    },
                    payment_details: {
                        transfer_note: '',
                        account_last_five_digits: '',
                        transfer_proof_url: '',
                    },
                    delivery_option: {
                        type: deliveryOption.type,
                        cost: deliveryOption.cost,
                        estimated_days_min: deliveryOption.estimatedDays?.min || 3,
                        estimated_days_max: deliveryOption.estimatedDays?.max || 5,
                        note: deliveryOption.note || '',
                    },
                },
            }

            // 使用 orderService 創建訂單
            const result = await orderService.createOrder(orderRequestData)

            // 處理回傳的訂單資料
            const orderData = Array.isArray(result) ? result[0] : result
            setCreatedOrder(orderData)

            // 進入付款資訊步驟
            handleNextStep()
        } catch (error: unknown) {
            console.error('Order creation failed:', error)

            let errorMessage = '訂單創建失敗，請稍後再試'

            if (error instanceof Error) {
                errorMessage = error.message
            }

            setOrderError(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePaymentComplete = () => {
        // 導航到成功頁面
        navigate('/order-success', {
            state: {
                orderId: createdOrder?.order_number || createdOrder?.id,
                order: createdOrder,
                bicycle,
                shippingInfo,
                paymentInfo,
                deliveryOption,
                orderCalculation,
            },
        })
    }

    if (!bicycle) {
        return null // Will redirect in useEffect
    }

    return (
        <MainLayout>
            <div className="container max-w-6xl px-4 py-8 mx-auto">
                <h1 className="mb-6 text-2xl font-bold">{t('checkout')}</h1>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <CheckoutStepper steps={steps} activeStep={currentStep} onStepClick={goToStep} />

                        <div className="p-6 mt-6 bg-white rounded-lg shadow">
                            {currentStep === 0 && (
                                <ShippingAddressForm initialValues={shippingInfo} onSubmit={handleShippingSubmit} />
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <DeliveryOptionsForm
                                        selectedOption={deliveryOption}
                                        onOptionChange={handleDeliveryOptionChange}
                                        city={shippingInfo.city}
                                        bicycleWeight={bicycle.weight}
                                    />
                                    <div className="flex justify-between space-x-4 pt-4">
                                        <Button type="button" variant="outline" onClick={handlePrevStep}>
                                            {t('previous')}
                                        </Button>
                                        <Button type="button" onClick={handleDeliverySubmit}>
                                            {t('continueToReview')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <CheckoutConfirmation
                                    bicycle={bicycle}
                                    shippingInfo={shippingInfo}
                                    paymentInfo={paymentInfo}
                                    deliveryOption={deliveryOption}
                                    onBack={handlePrevStep}
                                    onPlaceOrder={handleOrderReview}
                                    isSubmitting={isSubmitting}
                                />
                            )}

                            {currentStep === 3 && createdOrder && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-green-600">
                                        {t('orderCreatedSuccessfully')}
                                    </h3>

                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="space-y-3">
                                            <p className="font-medium">
                                                {t('orderNumber')}: {createdOrder.order_number}
                                            </p>
                                            <p className="text-sm text-green-700">{t('paymentDeadlineNotice')}</p>
                                            {createdOrder.remaining_payment_time_humanized && (
                                                <p className="text-sm font-medium text-orange-600">
                                                    {t('remainingTime')}:{' '}
                                                    {createdOrder.remaining_payment_time_humanized}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <BankAccountInfo
                                        amount={orderCalculation.total}
                                        transferNote={createdOrder.order_number}
                                        mode="compact"
                                        showCard={false}
                                        className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                                    />

                                    <div className="flex justify-between space-x-4">
                                        <Button type="button" variant="outline" onClick={handlePrevStep}>
                                            {t('previous')}
                                        </Button>
                                        <Button onClick={handlePaymentComplete}>
                                            {t('iUnderstandPaymentInstructions')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {orderError && (
                                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-700">{orderError}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <OrderSummary
                            bicycle={bicycle}
                            shipping={deliveryOption.cost}
                            deliveryOption={deliveryOption}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default Checkout
