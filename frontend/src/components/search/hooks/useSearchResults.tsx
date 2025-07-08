import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { bicycleService } from '@/api'
import { SearchFilters } from '../types'
import { BicycleType, BicycleCondition, IBicycle } from '@/types/bicycle.types'
import { BicycleCardProps } from '@/components/bicycles/BicycleCard'

export const useSearchResults = () => {
    const [searchParams] = useSearchParams()
    const [bicycles, setBicycles] = useState<BicycleCardProps[]>([])
    const [loading, setLoading] = useState(true)
    const [priceRange, setPriceRange] = useState<number[]>([0, 300000])
    const [filterVisible, setFilterVisible] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({
        conditions: [],
        priceMin: 0,
        priceMax: 300000,
    })

    // Toggle filter visibility on mobile
    const toggleFilterVisibility = () => {
        setFilterVisible((prev) => !prev)
    }

    // Toggle condition filter
    const toggleConditionFilter = (condition: BicycleCondition) => {
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
            conditions: [],
            priceMin: 0,
            priceMax: 300000,
        })
        setPriceRange([0, 300000])
    }

    // Update price range when slider value changes
    useEffect(() => {
        setSelectedFilters((prev) => ({
            ...prev,
            priceMin: priceRange[0],
            priceMax: priceRange[1],
        }))
    }, [priceRange])

    // Parse URL price parameters and update filters
    useEffect(() => {
        const urlPrice = searchParams.get('price')
        if (urlPrice) {
            const [priceMin, priceMax] = parsePriceRange(urlPrice)
            if (priceMin !== null || priceMax !== null) {
                setPriceRange([
                    priceMin !== null ? priceMin : 0,
                    priceMax !== null ? priceMax : 300000
                ])
            }
        }
    }, [searchParams])

    // Helper function to parse price range from URL parameter
    const parsePriceRange = (priceRange: string): [number | null, number | null] => {
        if (!priceRange) return [null, null]
        
        // Handle 300000+ format
        if (priceRange.endsWith('+')) {
            const minPrice = parseInt(priceRange.replace('+', ''), 10)
            return [isNaN(minPrice) ? null : minPrice, null]
        }
        
        // Handle min-max format
        if (priceRange.includes('-')) {
            const [minStr, maxStr] = priceRange.split('-')
            const minPrice = minStr ? parseInt(minStr, 10) : null
            const maxPrice = maxStr ? parseInt(maxStr, 10) : null
            return [
                isNaN(minPrice as number) ? null : minPrice,
                isNaN(maxPrice as number) ? null : maxPrice
            ]
        }
        
        // Single value treated as minimum
        const price = parseInt(priceRange, 10)
        return [isNaN(price) ? null : price, null]
    }

    // Fetch bicycles when search params or selected filters change
    useEffect(() => {
        const getBicycles = async () => {
            setLoading(true)
            try {
                // Parse URL price parameter to get min/max values
                const urlPrice = searchParams.get('price')
                let urlPriceMin: number | undefined
                let urlPriceMax: number | undefined
                
                if (urlPrice) {
                    const [parsedMin, parsedMax] = parsePriceRange(urlPrice)
                    urlPriceMin = parsedMin || undefined
                    urlPriceMax = parsedMax || undefined
                }
                
                // Construct params object based on IBicycleListParams (camelCase)
                // The conversion to snake_case is now handled within bicycleService.getBicycles
                const params: import('@/types/bicycle.types').IBicycleListParams = {
                    page: 1, // TODO: Implement actual pagination
                    limit: 20, // TODO: Make limit configurable or part of pagination
                    search: searchParams.get('q') || undefined,
                    // 從 URL 參數獲取自行車類型，而不是從分類篩選器
                    bicycleType: searchParams.get('type') ? [searchParams.get('type') as string] : undefined,
                    condition: selectedFilters.conditions.length > 0 ? selectedFilters.conditions : undefined,
                    // Use URL price parameters if available, otherwise fall back to selectedFilters
                    priceMin: urlPriceMin || (selectedFilters.priceMin > 0 ? selectedFilters.priceMin : undefined),
                    priceMax: urlPriceMax || (selectedFilters.priceMax > 0 && selectedFilters.priceMax < 300000 ? selectedFilters.priceMax : undefined),
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
                    // Transform IBicycle[] to BicycleCardProps[] (same as homepage)
                    const bicycleCardData: BicycleCardProps[] = response.bicycles
                        .filter((bike: IBicycle) => bike && bike.id) // Filter out invalid data
                        .map((bike: IBicycle) => ({
                            id: bike.id ? bike.id.toString() : '',
                            title: bike.title || 'Unknown Title',
                            price: typeof bike.price === 'number' ? bike.price : 0,
                            originalPrice: bike.original_price || bike.bicycle_model?.original_msrp || bike.originalPrice,
                            location: bike.location || 'Unknown Location',
                            condition: bike.condition || 'unknown',
                            brand: bike.brand_name || bike.brand?.name || 'Unknown Brand',
                            model: bike.model_name || bike.bicycle_model?.name || bike.title || 'Unknown Model',
                            year: bike.year || undefined,
                            frameSize: bike.frameSize || undefined,
                            transmission: bike.transmission_name || bike.transmission?.name || undefined,
                            imageUrl:
                                bike.photos_urls && bike.photos_urls.length > 0
                                    ? bike.photos_urls[0]
                                    : bike.photosUrls && bike.photosUrls.length > 0
                                    ? bike.photosUrls[0]
                                    : '/placeholder.svg',
                            isFavorite: bike.isFavorite || false,
                        }))
                    
                    setBicycles(bicycleCardData)
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
        toggleConditionFilter,
        resetFilters,
    }
}
