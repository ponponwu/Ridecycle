import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { bicycleService } from '@/api'
import { Bicycle, SearchFilters } from '../types'
import { BicycleType, BicycleCondition } from '@/types/bicycle.types'

export const useSearchResults = () => {
    const [searchParams] = useSearchParams()
    const [bicycles, setBicycles] = useState<Bicycle[]>([])
    const [loading, setLoading] = useState(true)
    const [priceRange, setPriceRange] = useState<number[]>([0, 5000])
    const [filterVisible, setFilterVisible] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({
        categories: [],
        conditions: [],
        priceMin: 0,
        priceMax: 5000,
    })

    // Toggle filter visibility on mobile
    const toggleFilterVisibility = () => {
        setFilterVisible((prev) => !prev)
    }

    // Toggle category filter
    const toggleCategoryFilter = (category: string) => {
        setSelectedFilters((prev) => {
            if (prev.categories.includes(category)) {
                return {
                    ...prev,
                    categories: prev.categories.filter((c) => c !== category),
                }
            } else {
                return {
                    ...prev,
                    categories: [...prev.categories, category],
                }
            }
        })
    }

    // Toggle condition filter
    const toggleConditionFilter = (condition: string) => {
        setSelectedFilters((prev) => {
            if (prev.conditions.includes(condition)) {
                return {
                    ...prev,
                    conditions: prev.conditions.filter((c) => c !== condition),
                }
            } else {
                return {
                    ...prev,
                    conditions: [...prev.conditions, condition],
                }
            }
        })
    }

    // Reset all filters
    const resetFilters = () => {
        setSelectedFilters({
            categories: [],
            conditions: [],
            priceMin: 0,
            priceMax: 5000,
        })
        setPriceRange([0, 5000])
    }

    // Update price range when slider value changes
    useEffect(() => {
        setSelectedFilters((prev) => ({
            ...prev,
            priceMin: priceRange[0],
            priceMax: priceRange[1],
        }))
    }, [priceRange])

    // Fetch bicycles when search params or selected filters change
    useEffect(() => {
        const getBicycles = async () => {
            setLoading(true)
            try {
                // Construct params object based on IBicycleListParams (camelCase)
                // The conversion to snake_case is now handled within bicycleService.getBicycles
                const params: import('@/types/bicycle.types').IBicycleListParams = {
                    page: 1, // TODO: Implement actual pagination
                    limit: 20, // TODO: Make limit configurable or part of pagination
                    search: searchParams.get('q') || undefined,
                    // Ensure that the values passed for bikeType and condition match what the backend expects
                    // If backend expects BicycleType/BicycleCondition enum string values, ensure they are passed correctly.
                    // The current IBicycleListParams uses string[] for these.
                    bikeType: selectedFilters.categories.length > 0 ? selectedFilters.categories : undefined,
                    condition: selectedFilters.conditions.length > 0 ? selectedFilters.conditions : undefined,
                    priceMin: selectedFilters.priceMin > 0 ? selectedFilters.priceMin : undefined,
                    // Ensure priceMax is only sent if it's a meaningful filter (e.g., not the default max)
                    priceMax:
                        selectedFilters.priceMax > 0 && selectedFilters.priceMax < 5000
                            ? selectedFilters.priceMax
                            : undefined,
                    location: searchParams.get('location') || undefined,
                    // Backend's brand filter might expect a single string or an array.
                    // IBicycleListParams has brand?: string[]
                    // If searchParams.get('brand') is a single string, wrap it in an array if service expects array.
                    // For now, assuming service handles single string or array for brand if it's flexible.
                    // Or, ensure backend can handle brand as a single string if that's what searchParams provides.
                    brand: searchParams.get('brand') ? [searchParams.get('brand') as string] : undefined,
                }

                // The bicycleService.getBicycles method now handles cleaning up undefined/null/empty params
                // and converting keys to snake_case.
                const response = await bicycleService.getBicycles(params)
                if (response && Array.isArray(response.bicycles)) {
                    setBicycles(
                        response.bicycles.map((bike) => ({
                            id: bike.id,
                            title: bike.title,
                            price: bike.price,
                            location: bike.location,
                            condition: bike.condition,
                            brand: bike.brand,
                            type: bike.bikeType,
                            imageUrl:
                                bike.photosUrls && bike.photosUrls.length > 0 ? bike.photosUrls[0] : '/placeholder.svg',
                            photosUrls: bike.photosUrls || [], // Ensure photosUrls is passed through
                        }))
                    )
                } else {
                    setBicycles([]) // Set to empty array if response or response.bicycles is not as expected
                }
            } catch (error) {
                console.error('Error fetching bicycles:', error)
                setBicycles([])
            } finally {
                setLoading(false)
            }
        }

        getBicycles()
    }, [searchParams, selectedFilters])

    return {
        bicycles,
        loading,
        priceRange,
        setPriceRange,
        filterVisible,
        toggleFilterVisibility,
        selectedFilters,
        toggleCategoryFilter,
        toggleConditionFilter,
        resetFilters,
    }
}
