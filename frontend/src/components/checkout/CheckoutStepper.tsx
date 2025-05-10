
import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CheckoutStepperProps {
  steps: string[];
  activeStep: number;
}

const CheckoutStepper = ({ steps, activeStep }: CheckoutStepperProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex w-full">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        
        return (
          <div key={index} className="flex flex-1 items-center">
            <div className={`relative flex flex-col items-center flex-1 ${index !== steps.length - 1 ? 'after:w-full after:h-0.5 after:bg-gray-200 after:absolute after:right-0 after:top-5 after:translate-x-1/2' : ''}`}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition ${
                  isCompleted ? 'bg-green-600' : isActive ? 'bg-blue-600' : 'bg-gray-300'
                } text-white z-10`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`mt-2 text-xs font-medium ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {t(step)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutStepper;
