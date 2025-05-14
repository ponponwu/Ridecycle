import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import bicycleService from '@/api/services/bicycle.service' // Add this line

import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useSellBikeForm } from '@/hooks/useSellBikeForm'
import { SellBikeFormValues } from '@/components/sell/types'
import { Form } from '@/components/ui/form'

import BasicDetailsStep from '@/components/sell/BasicDetailsStep'
import PhotosStep from '@/components/sell/PhotosStep'
import PricingLocationStep from '@/components/sell/PricingLocationStep'
import ReviewStep from '@/components/sell/ReviewStep'
import StepIndicator from '@/components/sell/StepIndicator'
import StepNavigation from '@/components/sell/StepNavigation'
import AuthRequiredPrompt from '@/components/sell/AuthRequiredPrompt'

const UploadBike = () => {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const form = useSellBikeForm()

    const totalSteps = 4 // Total number of steps
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100

    // 每個步驟需要驗證的字段
    const stepFields = [
        // 步驟 1: 基本詳情
        ['title', 'brand', 'model', 'year', 'bikeType', 'frameSize', 'description'],
        // 步驟 2: 照片和狀況
        ['photos', 'condition'],
        // 步驟 3: 定價和位置
        ['price', 'location', 'contactMethod'],
        // 步驟 4: 審核 (無需驗證，只是檢視)
        [],
    ]

    const nextStep = async () => {
        if (currentStep >= totalSteps - 1) return

        // 只驗證當前步驟的字段
        const fieldsToValidate = stepFields[currentStep]
        const isValid = await form.trigger(fieldsToValidate as Array<keyof SellBikeFormValues>)

        if (isValid) {
            setCurrentStep((prevStep) => prevStep + 1)
        } else {
            // 顯示錯誤消息
            toast.error('請填寫所有必填欄位', {
                description: '您需要填寫所有標記為必填的欄位才能繼續',
            })

            // 突出顯示錯誤字段（React Hook Form 已經處理了這部分）
            console.log('Form errors:', form.formState.errors)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prevStep) => prevStep - 1)
        }
    }

    const goToStep = (step: number) => {
        // 理想情況下，應該驗證之前的所有步驟
        // 這裡簡化為允許直接導航
        setCurrentStep(step)
    }

    const handleFinalSubmit = async () => {
        try {
            // 在最終提交前驗證所有字段
            const isValid = await form.trigger()
            if (!isValid) {
                toast.error('請填寫所有必填欄位', {
                    description: '您需要填寫所有標記為必填的欄位才能提交',
                })
                return
            }

            setIsSubmitting(true)
            setUploadProgress(0) // Reset progress

            const data = form.getValues()

            // Simulate initial progress
            await new Promise((resolve) => setTimeout(resolve, 100))
            setUploadProgress(10)

            const response = await bicycleService.createBicycle({
                ...data,
                price: parseFloat(data.price), // Convert price to number
            })

            // Simulate remaining upload progress
            for (let i = 20; i <= 100; i += 10) {
                await new Promise((resolve) => setTimeout(resolve, 100))
                setUploadProgress(i)
            }

            console.log('Form submitted successfully:', response)
            toast.success('Your bike has been listed successfully!')
            navigate('/')
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error('Failed to list your bike. Please try again.')
            setUploadProgress(0) // Reset progress on error
        } finally {
            setIsSubmitting(false)
        }
    }

    // Check if user is logged in
    if (!currentUser) {
        return (
            <MainLayout>
                <div className="container max-w-4xl mx-auto px-4 py-8">
                    <AuthRequiredPrompt />
                </div>
            </MainLayout>
        )
    }

    // Step content components
    const steps = [
        <BasicDetailsStep form={form} key="basic-details" />,
        <PhotosStep form={form} key="photos" />,
        <PricingLocationStep form={form} key="pricing-location" />,
        <ReviewStep form={form} key="review" />,
    ]

    return (
        <MainLayout>
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <StepIndicator
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        progressPercentage={progressPercentage}
                        goToStep={goToStep}
                        isSubmitting={isSubmitting}
                    />

                    <div className="p-4 sm:p-6">
                        <Form {...form}>
                            {/* 一個虛擬表單只用於顯示步驟，不處理實際提交 */}
                            <div>
                                {/* Display current step content */}
                                {steps[currentStep]}

                                {/* Navigation buttons */}
                                <StepNavigation
                                    currentStep={currentStep}
                                    totalSteps={totalSteps}
                                    prevStep={prevStep}
                                    nextStep={nextStep}
                                    onSubmit={handleFinalSubmit}
                                    form={form}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default UploadBike
