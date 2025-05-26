import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import CategoryFilter from './CategoryFilter'
import PriceRangeFilter from './PriceRangeFilter'
import ConditionFilter from './ConditionFilter'
import { BicycleCondition } from '@/types/bicycle.types'

interface FilterSidebarProps {
    priceRange: number[]
    setPriceRange: (range: number[]) => void
    selectedFilters: {
        categories: string[]
        conditions: BicycleCondition[]
        priceMin: number
        priceMax: number
    }
    toggleCategoryFilter: (category: string) => void
    toggleConditionFilter: (condition: BicycleCondition) => void
    resetFilters: () => void
    filterVisible: boolean
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    priceRange,
    setPriceRange,
    selectedFilters,
    toggleCategoryFilter,
    toggleConditionFilter,
    resetFilters,
    filterVisible,
}) => {
    const { t } = useTranslation()

    return (
        <div className={`${filterVisible ? 'block' : 'hidden'} lg:block`}>
            <CategoryFilter
                selectedCategories={selectedFilters.categories}
                toggleCategoryFilter={toggleCategoryFilter}
            />

            <PriceRangeFilter priceRange={priceRange} setPriceRange={setPriceRange} />

            <ConditionFilter
                selectedConditions={selectedFilters.conditions}
                toggleConditionFilter={toggleConditionFilter}
            />

            <Button variant="outline" className="w-full" onClick={resetFilters}>
                {t('resetFilters')}
            </Button>
        </div>
    )
}

export default FilterSidebar
