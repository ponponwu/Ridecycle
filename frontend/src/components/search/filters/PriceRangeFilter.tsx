import React from 'react'
import { useTranslation } from 'react-i18next'
import { Slider } from '@/components/ui/slider'
import { formatPriceNTD } from '@/utils/priceFormatter'
import { PRICE_SLIDER_CONFIG } from '@/constants/searchOptions'

interface PriceRangeFilterProps {
    priceRange: number[]
    setPriceRange: (range: number[]) => void
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({ priceRange, setPriceRange }) => {
    const { t } = useTranslation()

    return (
        <div className="space-y-4 mb-6">
            <h3 className="font-medium mb-3">{t('priceRange')}</h3>
            <Slider
                defaultValue={[...PRICE_SLIDER_CONFIG.defaultValue]}
                max={PRICE_SLIDER_CONFIG.max}
                step={PRICE_SLIDER_CONFIG.step}
                value={priceRange}
                className="w-full"
                onValueChange={setPriceRange}
            />
            <div className="flex justify-between text-sm text-gray-600">
                <span>{formatPriceNTD(priceRange[0])}</span>
                <span>{formatPriceNTD(priceRange[1])}</span>
            </div>
        </div>
    )
}

export default PriceRangeFilter
