import React from 'react'
import { useTranslation } from 'react-i18next'
import { Slider } from '@/components/ui/slider'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface PriceRangeFilterProps {
    priceRange: number[]
    setPriceRange: (range: number[]) => void
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({ priceRange, setPriceRange }) => {
    const { t } = useTranslation()

    return (
        <div className="space-y-4">
            <h3 className="font-medium mb-3">{t('priceRange')}</h3>
            <Slider
                defaultValue={[0, 100000]}
                max={100000}
                step={1000}
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
