import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import BicycleGrid from '@/components/bicycles/BicycleGrid'
import { BicycleCardProps } from '@/components/bicycles/BicycleCard'

interface ResultsTabsProps {
    bicycles: BicycleCardProps[]
    loading: boolean
    resetFilters: () => void
}

const ResultsTabs: React.FC<ResultsTabsProps> = ({ bicycles, loading, resetFilters }) => {
    const { t } = useTranslation()

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-blue"></div>
            </div>
        )
    }

    if (bicycles.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-lg text-gray-600">{t('noBicyclesFound')}</p>
                <Button className="mt-4" onClick={resetFilters}>
                    {t('resetFilters')}
                </Button>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <span className="text-lg font-semibold text-gray-900">
                        {bicycles.length} {t('resultsFound')}
                    </span>
                    {loading && <span className="ml-2 text-sm text-blue-500">{t('loading')}...</span>}
                </div>
            </div>
            <BicycleGrid bicycles={bicycles} />
        </div>
    )
}

export default ResultsTabs
