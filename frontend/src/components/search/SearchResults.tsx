import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchResults } from './hooks/useSearchResults'
import ResultsHeader from './results/ResultsHeader'
import FilterSidebar from './filters/FilterSidebar'
import ResultsTabs from './results/ResultsTabs'

const SearchResults: React.FC = () => {
    const { t } = useTranslation()
    const {
        bicycles,
        loading,
        priceRange,
        setPriceRange,
        filterVisible,
        toggleFilterVisibility,
        selectedFilters,
        toggleConditionFilter,
        resetFilters,
    } = useSearchResults()

    return (
        <div className="container mx-auto px-4 py-8">
            <ResultsHeader
                resultsCount={bicycles.length}
                loading={loading}
                onToggleFilters={toggleFilterVisibility}
                filterVisible={filterVisible}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters */}
                <FilterSidebar
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    selectedFilters={selectedFilters}
                    toggleConditionFilter={toggleConditionFilter}
                    resetFilters={resetFilters}
                    filterVisible={filterVisible}
                />

                {/* Results */}
                <div className="lg:col-span-3">
                    <ResultsTabs bicycles={bicycles} loading={loading} resetFilters={resetFilters} />
                </div>
            </div>
        </div>
    )
}

export default SearchResults
