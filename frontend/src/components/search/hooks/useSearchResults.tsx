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
                // 構建查詢參數
                const params = {
                    page: 1,
                    limit: 20,
                    search: searchParams.get('q') || undefined,
                    bikeType:
                        selectedFilters.categories.length > 0
                            ? selectedFilters.categories.map((c) => c as BicycleType)
                            : undefined,
                    condition:
                        selectedFilters.conditions.length > 0
                            ? selectedFilters.conditions.map((c) => c as BicycleCondition)
                            : undefined,
                    priceMin: selectedFilters.priceMin,
                    priceMax: selectedFilters.priceMax,
                    location: searchParams.get('location') || undefined,
                    brand: searchParams.get('brand') ? [searchParams.get('brand') as string] : undefined,
                }

                const response = await bicycleService.getBicycles(params)
                setBicycles(
                    response.bicycles.map((bike) => ({
                        id: bike.id,
                        title: `${bike.brand} ${bike.model}`,
                        price: bike.price,
                        location: bike.location,
                        condition: bike.condition,
                        brand: bike.brand,
                        type: bike.bikeType,
                        imageUrl: bike.photos && bike.photos.length > 0 ? bike.photos[0] : undefined,
                    }))
                )
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
