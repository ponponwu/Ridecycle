import React from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutStepperProps {
    steps: string[]
    activeStep: number
    onStepClick: (stepIndex: number) => void
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ steps, activeStep, onStepClick }) => {
    const { t } = useTranslation()

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                        <button
                            onClick={() => onStepClick(index)}
                            disabled={index > activeStep}
                            className="flex items-center cursor-pointer disabled:cursor-not-allowed"
                        >
                            {/* 步驟圓圈 */}
                            <div
                                className={cn(
                                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                                    {
                                        'bg-blue-600 text-white border-blue-600': index <= activeStep,
                                        'bg-gray-100 text-gray-400 border-gray-300': index > activeStep,
                                    }
                                )}
                            >
                                {index < activeStep ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>

                            {/* 步驟標題 */}
                            <div className="ml-3">
                                <div
                                    className={cn('text-sm font-medium transition-colors', {
                                        'text-blue-600': index <= activeStep,
                                        'text-gray-400': index > activeStep,
                                    })}
                                >
                                    {step}
                                </div>
                            </div>
                        </button>

                        {/* 連接線 */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn('flex-1 h-px mx-4 transition-colors', {
                                    'bg-blue-600': index < activeStep,
                                    'bg-gray-300': index >= activeStep,
                                })}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* 進度條 (可選的額外視覺效果) */}
            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

export default CheckoutStepper
