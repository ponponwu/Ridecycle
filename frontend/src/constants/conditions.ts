import { BicycleCondition } from '@/types/bicycle.types'
import { TFunction } from 'i18next'

export interface ConditionOption {
    value: BicycleCondition
    i18nKey: string
    label?: string // Optional: for cases where direct label might still be needed, or for testing
}

export const conditionEnumOptions: ConditionOption[] = [
    { value: BicycleCondition.BRAND_NEW, i18nKey: 'conditionOptions.brandNew' },
    { value: BicycleCondition.LIKE_NEW, i18nKey: 'conditionOptions.likeNew' },
    { value: BicycleCondition.EXCELLENT, i18nKey: 'conditionOptions.excellent' },
    { value: BicycleCondition.GOOD, i18nKey: 'conditionOptions.good' },
    { value: BicycleCondition.FAIR, i18nKey: 'conditionOptions.fair' },
    { value: BicycleCondition.POOR, i18nKey: 'conditionOptions.poor' },
]

/**
 * Returns condition options with translated labels.
 * @param t - The TFunction from react-i18next.
 * @returns Array of condition options with translated labels.
 */
export const getTranslatedConditionOptions = (t: TFunction): { value: BicycleCondition; label: string }[] => {
    return conditionEnumOptions.map((option) => ({
        value: option.value,
        label: t(option.i18nKey),
    }))
}

/**
 * Gets the i18n key for a given BicycleCondition value.
 * Useful for directly translating a condition value if needed.
 * @param value - The BicycleCondition enum value.
 * @returns The i18n key string or an empty string if not found.
 */
export const getConditionI18nKey = (value: BicycleCondition): string => {
    const option = conditionEnumOptions.find((opt) => opt.value === value)
    return option ? option.i18nKey : ''
}
