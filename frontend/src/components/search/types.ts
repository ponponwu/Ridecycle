import { BicycleCondition } from '@/types/bicycle.types'

export interface Bicycle {
    id: string
    title: string
    price: number
    location: string
    condition: string
    brand: string
    type: string
    imageUrl: string
    photosUrls?: string[] // Added to match the data structure for BicycleCard
}

export interface SearchFilters {
    conditions: BicycleCondition[]
    priceMin: number
    priceMax: number
}
