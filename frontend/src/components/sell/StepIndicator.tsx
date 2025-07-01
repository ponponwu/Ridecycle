import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Bike, Camera, DollarSign, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface StepIndicatorProps {
    currentStep: number
    totalSteps: number
    progressPercentage: number
    goToStep: (step: number) => void
    isSubmitting: boolean
}

interface StepInfo {
    title: string
    icon: React.ReactNode
}

const StepIndicator = ({ currentStep, totalSteps, progressPercentage, goToStep, isSubmitting }: StepIndicatorProps) => {
    const { t } = useTranslation()
    
    const steps: StepInfo[] = [
        {
            title: t('sellStepTitles.bikeDetails'),
            icon: <Bike className="h-5 w-5" />,
        },
        {
            title: t('sellStepTitles.photos'),
            icon: <Camera className="h-5 w-5" />,
        },
        {
            title: t('sellStepTitles.pricing'),
            icon: <DollarSign className="h-5 w-5" />,
        },
        {
            title: t('sellStepTitles.review'),
            icon: <CheckCircle className="h-5 w-5" />,
        },
    ]

    return (
        <div className="border-b border-gray-200 bg-gray-50">
            <div className="p-4 sm:p-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('sellYourBike')}</h1>
                <p className="mt-1 text-sm text-gray-500">{t('completeFormToList')}</p>
            </div>

            {/* Progress bar */}
            <div className="px-4 sm:px-6 pb-4">
                <Progress value={progressPercentage} className="h-2" />
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>
                        {t('stepXOfY', { current: currentStep + 1, total: totalSteps })}
                    </span>
                    <span>{t('percentComplete', { percent: Math.round(progressPercentage) })}</span>
                </div>
            </div>

            {/* Step indicators */}
            <div className="px-4 sm:px-6 pb-6 overflow-x-auto">
                <div className="flex space-x-1 min-w-max">
                    {steps.map((step, index) => (
                        <button
                            key={index}
                            onClick={() => goToStep(index)}
                            disabled={isSubmitting}
                            className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                index === currentStep
                                    ? 'bg-marketplace-blue text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-2">{step.icon}</span>
                            <span className="hidden sm:inline">{step.title}</span>
                            <span className="inline sm:hidden">{index + 1}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default StepIndicator
