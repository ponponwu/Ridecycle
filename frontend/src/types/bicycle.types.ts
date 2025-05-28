// src/types/bicycle.types.ts
/**
 * 自行車狀態枚舉
 */
export enum BicycleStatus {
    PENDING = 'pending', // 0 - 待審核 (新建立的自行車預設狀態)
    AVAILABLE = 'available', // 1 - 可購買
    SOLD = 'sold', // 2 - 已售出
    DRAFT = 'draft', // 3 - 草稿/被拒絕
}

/**
 * 自行車條件枚舉
 */
export enum BicycleCondition {
    BRAND_NEW = 'brand_new',
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
}

/**
 * 自行車類型介面（用於 UI 選擇）
 */
export interface IBicycleTypeOption {
    value: BicycleType
    label: string
}

/**
 * 自行車類型選項列表
 */
export const BICYCLE_TYPES: { value: BicycleType; translationKey: string }[] = [
    { value: BicycleType.ROAD, translationKey: 'roadbike' },
    { value: BicycleType.MOUNTAIN, translationKey: 'mountainbike' },
]

/**
 * 自行車賣家/使用者簡要資訊介面
 */
export interface IBicycleUser {
    id: number // Assuming user ID is a number from backend
    name: string
    full_name?: string // 添加 full_name 屬性
    email?: string // Email might only be present in detailed views
    avatar_url?: string // 添加頭像 URL 屬性
    created_at?: string
    updated_at?: string
}

/**
 * 品牌介面
 */
export interface IBrand {
    id: number // 修正為 number 類型
    name: string
    created_at: string
    updated_at: string
}

/**
 * 自行車型號介面
 */
export interface IBicycleModel {
    id: number
    name: string
    brand_id: number
    created_at: string
    updated_at: string
}

/**
 * 自行車詳情介面
 */
export interface IBicycle {
    id: string
    title: string
    brandId: string
    transmissionId: string
    bicycleModelId?: string
    year: string
    bicycleType: string
    frameSize: string
    description: string
    condition: BicycleCondition
    price: number
    location: string
    contactMethod: string
    photosUrls: string[] // 統一的圖片 URL 陣列
    status: string
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
    yearsOfUse?: number
    specifications?: Record<string, string>
    conversationCount?: number
    // 統一的關聯物件
    brand?: IBrand // 品牌完整物件
    bicycle_model?: IBicycleModel // 型號完整物件
    seller?: IBicycleUser // 賣家完整物件
    sellerRating?: number
}

/**
 * 自行車創建請求介面
 */
export interface IBicycleCreateRequest {
    title: string
    brand: string
    model: string
    year: string
    bicycleType: string // Assuming form sends string, consistent with IBicycle
    frameSize: string
    description: string
    condition: BicycleCondition // 使用 BicycleCondition 枚舉
    price: number // Or string if form input is string, then parse in service/backend
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
    brandId?: string
    transmissionId?: string
    year?: string
    bicycleType?: string
    frameSize?: string
    description?: string
    condition?: BicycleCondition
    price?: number // Or string
    location?: string
    contactMethod?: string
    photos?: File[]
    existingPhotos?: Array<{ id: string; url?: string }>
    photosToDelete?: string[] // Added for existing photo IDs to delete
    status?: string
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
    bicycleType?: string[] // Assuming filters will use string values
    condition?: string[] // Assuming filters will use string values
    priceMin?: number
    priceMax?: number
    location?: string
    brand?: string[]
    status?: string[] // Assuming filters will use string values
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

/**
 * 帶有擁有者資訊的自行車介面（用於管理員視圖）
 */
export interface BicycleWithOwner extends IBicycle {
    user_id: number // 用戶 ID
}
