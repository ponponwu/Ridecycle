import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { SellBikeFormValues } from './types'
import { useTranslation } from 'react-i18next'

export interface StepNavigationProps {
    currentStep: number
    totalSteps: number
    prevStep: () => void
    nextStep: () => void
    onSubmit?: () => void
    form: UseFormReturn<SellBikeFormValues>
    isSubmitting: boolean
    isEditMode?: boolean
}

const StepNavigation = ({
    currentStep,
    totalSteps,
    prevStep,
    nextStep,
    onSubmit,
    form,
    isSubmitting,
    isEditMode = false,
}: StepNavigationProps) => {
    const { t } = useTranslation()
    const isLastStep = currentStep === totalSteps - 1
    const isFormValid = form.formState.isValid

    return (
        <div className="mt-8 flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                {t('previous')}
            </Button>

            {!isLastStep ? (
                <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                    {t('continue')}
                </Button>
            ) : (
                <Button type="button" onClick={onSubmit} disabled={isSubmitting || !isFormValid}>
                    {isSubmitting 
                        ? t('submitting') 
                        : isEditMode 
                            ? t('updateBike') 
                            : t('listBikeForSale')
                    }
                </Button>
            )}
        </div>
    )
}

export default StepNavigation
