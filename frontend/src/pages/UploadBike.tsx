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
    const form = useSellBikeForm()
    const { formState } = form

    const totalSteps = 4 // Total number of steps
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prevStep) => prevStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prevStep) => prevStep - 1)
        }
    }

    const goToStep = (step: number) => {
        setCurrentStep(step)
    }

    const onSubmit = async (data: SellBikeFormValues) => {
        try {
            setUploadProgress(0) // Reset progress

            // TODO: Handle image uploads and get their URLs or identifiers
            // For now, assuming photos are File objects and backend handles them.
            // The bicycleService.createBicycle method already handles FormData.

            // Simulate initial progress
            await new Promise((resolve) => setTimeout(resolve, 100))
            setUploadProgress(10)

            const response = await bicycleService.createBicycle({
                ...data,
                // Ensure photos are correctly passed if they are part of 'data'
                // If 'photos' in SellBikeFormValues are File[] then it's fine.
                // If they are URLs or other types, adjust accordingly.
                // photos: data.photos, // Assuming data.photos is already in the correct format (File[])
                status: 'available', // Set default status or get from form
                sellerId: currentUser?.id || '', // Ensure sellerId is passed
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
                        isSubmitting={formState.isSubmitting}
                    />

                    <div className="p-4 sm:p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                {/* Display current step content */}
                                {steps[currentStep]}

                                {/* Navigation buttons */}
                                <StepNavigation
                                    currentStep={currentStep}
                                    totalSteps={totalSteps}
                                    prevStep={prevStep}
                                    nextStep={nextStep}
                                    form={form}
                                    isSubmitting={formState.isSubmitting}
                                />
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default UploadBike
