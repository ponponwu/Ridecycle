import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { SellBikeFormValues } from './types'

interface StepNavigationProps {
    currentStep: number
    totalSteps: number
    prevStep: () => void
    nextStep: () => void
    onSubmit?: () => void
    form: UseFormReturn<SellBikeFormValues>
    isSubmitting: boolean
}

const StepNavigation = ({
    currentStep,
    totalSteps,
    prevStep,
    nextStep,
    onSubmit,
    form,
    isSubmitting,
}: StepNavigationProps) => {
    const isLastStep = currentStep === totalSteps - 1
    const isFormValid = form.formState.isValid

    return (
        <div className="mt-8 flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                Previous
            </Button>

            {!isLastStep ? (
                <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                    Continue
                </Button>
            ) : (
                <Button type="button" onClick={onSubmit} disabled={isSubmitting || !isFormValid}>
                    {isSubmitting ? 'Submitting...' : 'List Bike for Sale'}
                </Button>
            )}
        </div>
    )
}

export default StepNavigation
