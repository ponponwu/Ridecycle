import React from 'react'
import { useTranslation } from 'react-i18next'

interface BicycleSpecificationsProps {
    brand: string
    model: string
    year: number
    frameSize: string
    wheelSize: string
    yearsOfUse?: number // Made optional
}

const BicycleSpecifications = ({
    brand,
    model,
    year,
    frameSize,
    wheelSize,
    yearsOfUse, // Now optional
}: BicycleSpecificationsProps) => {
    const { t } = useTranslation()

    return (
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
                <span className="block font-medium text-gray-900">{t('brand')}</span>
                <span className="text-gray-600">{brand || 'N/A'}</span>
            </div>
            <div>
                <span className="block font-medium text-gray-900">{t('model')}</span>
                <span className="text-gray-600">{model || 'N/A'}</span>
            </div>
            <div>
                <span className="block font-medium text-gray-900">{t('year')}</span>
                <span className="text-gray-600">{year || 'N/A'}</span>
            </div>
            <div>
                <span className="block font-medium text-gray-900">{t('frameSize')}</span>
                <span className="text-gray-600">{frameSize || 'N/A'}</span>
            </div>
            <div>
                <span className="block font-medium text-gray-900">{t('wheelSize')}</span>
                <span className="text-gray-600">{wheelSize || 'N/A'}</span>
            </div>
            {typeof yearsOfUse === 'number' && ( // Only display if yearsOfUse is provided and is a number
                <div>
                    <span className="block font-medium text-gray-900">{t('yearsOfUse')}</span>
                    <span className="text-gray-600">
                        {yearsOfUse} {t(yearsOfUse === 1 ? 'year' : 'years')}
                    </span>
                </div>
            )}
        </div>
    )
}

export default BicycleSpecifications
