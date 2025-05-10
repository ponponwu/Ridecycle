// src/types/bicycle.types.ts
/**
 * 自行車狀態枚舉
 */
export enum BicycleStatus {
    AVAILABLE = 'available',
    SOLD = 'sold',
    PENDING = 'pending',
    DRAFT = 'draft',
}

/**
 * 自行車條件枚舉
 */
export enum BicycleCondition {
    NEW = 'new',
    LIKE_NEW = 'like_new',
    EXCELLENT = 'excellent',
    GOOD = 'good',
    FAIR = 'fair',
    POOR = 'poor',
}

/**
 * 自行車類型枚舉
 */
export enum BicycleType {
    ROAD = 'road',
    MOUNTAIN = 'mountain',
    HYBRID = 'hybrid',
    CITY = 'city',
    ELECTRIC = 'electric',
    KIDS = 'kids',
    BMX = 'bmx',
    FOLDING = 'folding',
    GRAVEL = 'gravel',
    TOURING = 'touring',
    FIXED_GEAR = 'fixed_gear',
    OTHER = 'other',
}

/**
 * 自行車詳情介面
 */
export interface IBicycle {
    id: string
    title: string
    brand: string
    model: string
    year: string
    bikeType: BicycleType
    frameSize: string
    description: string
    condition: BicycleCondition
    price: number
    location: string
    contactMethod: string
    photos: string[]
    userId: string
    sellerName: string
    sellerRating?: number
    status: BicycleStatus
    createdAt: string
    updatedAt: string
    isFavorite?: boolean
    viewCount?: number
    wheelSize?: string
    color?: string
    material?: string
    suspension?: string
    gears?: number
    weight?: number
    specifications?: Record<string, string>
    conversationCount?: number
}

/**
 * 自行車創建請求介面
 */
export interface IBicycleCreateRequest {
    title: string
    brand: string
    model: string
    year: string
    bikeType: BicycleType
    frameSize: string
    description: string
    condition: BicycleCondition
    price: number
    location: string
    contactMethod: string
    photos: File[]
    wheelSize?: string
    color?: string
    material?: string
    suspension?: string
    gears?: number
    weight?: number
    specifications?: Record<string, string>
}

/**
 * 自行車更新請求介面
 */
export interface IBicycleUpdateRequest {
    title?: string
    brand?: string
    model?: string
    year?: string
    bikeType?: BicycleType
    frameSize?: string
    description?: string
    condition?: BicycleCondition
    price?: number
    location?: string
    contactMethod?: string
    photos?: (File | string)[]
    status?: BicycleStatus
    wheelSize?: string
    color?: string
    material?: string
    suspension?: string
    gears?: number
    weight?: number
    specifications?: Record<string, string>
}

/**
 * 自行車列表參數介面
 */
export interface IBicycleListParams {
    page?: number
    limit?: number
    search?: string
    bikeType?: BicycleType[]
    condition?: BicycleCondition[]
    priceMin?: number
    priceMax?: number
    location?: string
    brand?: string[]
    status?: BicycleStatus[]
    sort?: 'newest' | 'price_low' | 'price_high' | 'popular'
}

/**
 * 自行車列表響應介面
 */
export interface IBicycleListResponse {
    bicycles: IBicycle[]
    totalCount: number
    page: number
    limit: number
    totalPages: number
}

/**
 * 自行車購物車項目介面
 */
export interface IBicycleCartItem {
    bicycleId: string
    title: string
    price: number
    imageUrl: string
    sellerName: string
}
