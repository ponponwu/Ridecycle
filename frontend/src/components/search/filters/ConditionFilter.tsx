import React from 'react'
import { useTranslation } from 'react-i18next'
import { BicycleCondition } from '@/types/bicycle.types'
import { conditionEnumOptions } from '@/constants/conditions'

interface ConditionFilterProps {
    selectedConditions: BicycleCondition[]
    toggleConditionFilter: (condition: BicycleCondition) => void
}

const ConditionFilter: React.FC<ConditionFilterProps> = ({ selectedConditions, toggleConditionFilter }) => {
    const { t } = useTranslation()

    return (
        <div className="mb-6">
            <h3 className="font-medium mb-3">{t('condition')}</h3>
            <div className="space-y-2">
                {conditionEnumOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                        <input
                            type="checkbox"
                            id={`condition-${option.value}`}
                            checked={selectedConditions.includes(option.value)}
                            onChange={() => toggleConditionFilter(option.value)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`condition-${option.value}`} className="ml-2 text-sm text-gray-700">
                            {t(option.i18nKey)}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ConditionFilter
