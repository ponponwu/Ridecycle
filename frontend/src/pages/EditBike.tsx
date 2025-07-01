import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import bicycleService from '@/api/services/bicycle.service'
import { IBicycle, BicycleCondition } from '@/types/bicycle.types'
import { useTranslation } from 'react-i18next'
import { UseFormReturn } from 'react-hook-form'

import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useSellBikeForm } from '@/hooks/useSellBikeForm'
import { Form } from '@/components/ui/form'

import BasicDetailsStep from '@/components/sell/BasicDetailsStep'
import PhotosStep from '@/components/sell/PhotosStep'
import PricingLocationStep from '@/components/sell/PricingLocationStep'
import ReviewStep from '@/components/sell/ReviewStep'
import StepIndicator, { StepIndicatorProps } from '@/components/sell/StepIndicator'
import StepNavigation, { StepNavigationProps } from '@/components/sell/StepNavigation'
import AuthRequiredPrompt from '@/components/sell/AuthRequiredPrompt'
import { SellBikeFormValues } from '@/components/sell/types'
import { IBicycleUpdateRequest } from '@/types/bicycle.types'

export interface EditBikeFormValues extends SellBikeFormValues {
    photosToDelete?: string[]
    existingPhotos?: { id: string; url: string }[]
}

const EditBike = () => {
    const { t } = useTranslation()
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const { bicycleId } = useParams<{ bicycleId: string }>()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(true)
    const form: UseFormReturn<EditBikeFormValues> = useSellBikeForm(t) as UseFormReturn<EditBikeFormValues>
    const [initialBikeDataForForm, setInitialBikeDataForForm] = useState<Partial<EditBikeFormValues>>({})

    const totalSteps = 4
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100

    const stepFields: Array<Array<keyof EditBikeFormValues>> = [
        ['title', 'brandId', 'transmissionId', 'year', 'bicycleType', 'frameSize', 'description'],
        ['photos', 'condition', 'existingPhotos', 'photosToDelete'],
        ['price', 'originalPrice', 'location', 'contactMethod'],
        [],
    ]

    useEffect(() => {
        if (!bicycleId) {
            toast.error(t('bicycleIdMissing'))
            navigate('/profile')
            return
        }

        const fetchBikeData = async () => {
            try {
                setIsLoadingData(true)
                const bikeData: IBicycle = await bicycleService.getBicycleById(bicycleId)
                console.log('Raw bikeData from API:', bikeData)

                const transformedData: Partial<EditBikeFormValues> = {
                    title: bikeData.title,
                    brandId: bikeData.brandId,
                    transmissionId: bikeData.transmissionId,
                    year: bikeData.year?.toString(),
                    bicycleType: bikeData.bicycleType,
                    frameSize: bikeData.frameSize,
                    description: bikeData.description,
                    condition: bikeData.condition as BicycleCondition,
                    price: (typeof bikeData.price === 'number'
                        ? bikeData.price
                        : parseFloat(bikeData.price)
                    ).toString(),
                    originalPrice: bikeData.originalPrice ? bikeData.originalPrice.toString() : bikeData.original_price ? bikeData.original_price.toString() : undefined,
                    location: bikeData.location,
                    contactMethod: bikeData.contactMethod,
                    photos: [],
                    existingPhotos:
                        bikeData.photosUrls?.map((url, index) => ({ id: `existing-${index}-${Date.now()}`, url })) ||
                        [],
                    photosToDelete: [],
                }

                setInitialBikeDataForForm(transformedData)

                // Reset the form with the transformed data
                form.reset(transformedData)

                // Explicitly set existingPhotos in the form state as a safeguard
                if (transformedData.existingPhotos) {
                    form.setValue('existingPhotos', transformedData.existingPhotos, { shouldValidate: true })
                    console.log('EditBike: Explicitly set existingPhotos in form:', form.getValues('existingPhotos'))
                }

                // Log the form values after reset for debugging
                console.log('Form values after reset in EditBike:', form.getValues())
            } catch (error) {
                console.error('Failed to fetch bicycle data:', error)
                toast.error(t('failedToLoadBicycleData'))
                navigate('/profile')
            } finally {
                setIsLoadingData(false)
            }
        }

        fetchBikeData()
    }, [bicycleId, navigate, form, t])

    const nextStep = async () => {
        if (currentStep >= totalSteps - 1) return
        const fieldsToValidate = stepFields[currentStep] as Array<keyof EditBikeFormValues>
        const isValid = await form.trigger(fieldsToValidate)
        if (isValid) {
            setCurrentStep((prevStep) => prevStep + 1)
        } else {
            toast.error(t('fillRequiredFields'))
        }
    }

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep((prevStep) => prevStep - 1)
    }

    const goToStep = (step: number) => setCurrentStep(step)

    const handleFinalSubmit = async () => {
        if (!bicycleId) return
        const isValid = await form.trigger()
        if (!isValid) {
            toast.error(t('ensureAllFieldsFilledOut'))
            return
        }
        setIsSubmitting(true)
        try {
            const data = form.getValues()

            const newPhotos: File[] = []
            if (data.photos && Array.isArray(data.photos)) {
                data.photos.forEach((file) => {
                    if (file instanceof File) {
                        newPhotos.push(file)
                    }
                })
            }

            const updateRequest: IBicycleUpdateRequest = {
                title: data.title,
                brandId: data.brandId,
                transmissionId: data.transmissionId,
                year: data.year,
                bicycleType: data.bicycleType,
                frameSize: data.frameSize,
                description: data.description,
                condition: data.condition as BicycleCondition,
                price: data.price ? parseFloat(data.price) : undefined,
                originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
                location: data.location,
                contactMethod: data.contactMethod,
                photosToDelete: data.photosToDelete && data.photosToDelete.length > 0 ? data.photosToDelete : undefined,
                photos: newPhotos.length > 0 ? newPhotos : undefined,
            }

            await bicycleService.updateBicycle(bicycleId, updateRequest)
            toast.success(t('bicycleUpdatedSuccessfully'))
            navigate(`/bicycle/${bicycleId}`)
        } catch (error) {
            console.error('Error updating bicycle:', error)
            toast.error(t('failedToUpdateBicycle'))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!currentUser)
        return (
            <MainLayout>
                <AuthRequiredPrompt />
            </MainLayout>
        )
    if (isLoadingData)
        return (
            <MainLayout>
                <div className="container text-center py-10">{t('loadingBicycleData')}</div>
            </MainLayout>
        )

    const photosStepProps = {
        form: form,
        isEditMode: true,
        existingPhotos: initialBikeDataForForm.existingPhotos || [],
    }

    const reviewStepProps = {
        form: form,
        isEditMode: true,
    }

    const stepIndicatorProps: StepIndicatorProps = {
        currentStep,
        totalSteps,
        progressPercentage,
        goToStep,
        isSubmitting,
    }

    const stepNavigationProps: StepNavigationProps = {
        currentStep,
        totalSteps,
        prevStep,
        nextStep,
        onSubmit: handleFinalSubmit,
        form: form,
        isSubmitting,
        isEditMode: true,
    }

    const steps = [
        <BasicDetailsStep form={form} key="basic-details" />,
        <PhotosStep {...photosStepProps} key="photos" />,
        <PricingLocationStep form={form} key="pricing-location" />,
        <ReviewStep {...reviewStepProps} key="review" />,
    ]

    return (
        <MainLayout>
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <StepIndicator {...stepIndicatorProps} />
                    <div className="p-4 sm:p-6">
                        <Form {...form}>
                            <div>
                                {steps[currentStep]}
                                <StepNavigation {...stepNavigationProps} />
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default EditBike
