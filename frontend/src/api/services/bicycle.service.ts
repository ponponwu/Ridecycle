// src/api/services/bicycle.service.ts
import apiClient from '../client'
import {
    IBicycle,
    IBicycleCreateRequest,
    IBicycleUpdateRequest,
    IBicycleListParams,
    IBicycleListResponse,
    BicycleStatus,
} from '@/types/bicycle.types'

// Helper function to convert camelCase to snake_case
const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

/**
 * 自行車相關 API 服務
 */
export class BicycleService {
    /**
     * 獲取自行車列表
     * @param {IBicycleListParams} params - 列表參數
     * @returns {Promise<IBicycleListResponse>} 自行車列表響應
     */
    public async getBicycles(params?: IBicycleListParams): Promise<IBicycleListResponse> {
        return apiClient.get<IBicycleListResponse>('/bicycles', { params })
    }

    /**
     * 獲取自行車詳情
     * @param {string} id - 自行車 ID
     * @returns {Promise<IBicycle>} 自行車詳情
     */
    public async getBicycleById(id: string): Promise<IBicycle> {
        return apiClient.get<IBicycle>(`/bicycles/${id}`)
    }

    /**
     * 創建新自行車列表
     * @param {IBicycleCreateRequest} data - 自行車創建數據
     * @returns {Promise<IBicycle>} 創建的自行車
     */
    public async createBicycle(data: IBicycleCreateRequest): Promise<IBicycle> {
        const formData = new FormData()

        // 添加基本信息
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photos') {
                // Handle photos separately
                if (value && Array.isArray(value)) {
                    value.forEach((photoFile: File) => {
                        formData.append(`bicycle[photos][]`, photoFile)
                    })
                }
            } else if (key === 'specifications') {
                // Handle specifications separately
                if (value) {
                    // value here is the specifications object
                    formData.append(`bicycle[specifications]`, JSON.stringify(value))
                }
            } else if (value !== undefined && value !== null) {
                // For other fields, ensure they are nested under 'bicycle'
                // and convert key to snake_case
                const snakeCaseKey = camelToSnakeCase(key)
                formData.append(`bicycle[${snakeCaseKey}]`, String(value))
            }
        })

        // Note: The photos and specifications are now handled inside the loop.
        // The original separate blocks for photos and specifications can be removed if all data keys are iterated.
        // However, IBicycleCreateRequest might have optional fields, so ensuring all relevant keys from 'data' are processed is key.
        // The current loop iterates over `data`'s own enumerable properties.

        return apiClient.post<IBicycle>('bicycles', formData, {
            // apiClient prepends /api/v1
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    /**
     * 更新自行車信息
     * @param {string} id - 自行車 ID
     * @param {IBicycleUpdateRequest} data - 自行車更新數據
     * @returns {Promise<IBicycle>} 更新後的自行車
     */
    public async updateBicycle(id: string, data: IBicycleUpdateRequest): Promise<IBicycle> {
        const formData = new FormData()

        // 添加基本信息
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'photos' && key !== 'specifications' && value !== undefined) {
                formData.append(key, String(value))
            }
        })

        // 添加規格信息
        if (data.specifications) {
            formData.append('specifications', JSON.stringify(data.specifications))
        }

        // 添加照片
        if (data.photos && data.photos.length > 0) {
            // 保存的字符串照片 URL
            const existingPhotos = data.photos.filter((p) => typeof p === 'string')
            if (existingPhotos.length > 0) {
                formData.append('existingPhotos', JSON.stringify(existingPhotos))
            }

            // 新添加的照片文件
            data.photos.forEach((photo) => {
                if (photo instanceof File) {
                    formData.append(`newPhotos`, photo)
                }
            })
        }

        return apiClient.patch<IBicycle>(`/bicycles/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    /**
     * 刪除自行車
     * @param {string} id - 自行車 ID
     * @returns {Promise<void>}
     */
    public async deleteBicycle(id: string): Promise<void> {
        return apiClient.delete(`/bicycles/${id}`)
    }

    /**
     * 獲取當前用戶的自行車列表
     * @param {IBicycleListParams} params - 列表參數
     * @returns {Promise<IBicycleListResponse>} 自行車列表響應
     */
    public async getMyBicycles(params?: IBicycleListParams): Promise<IBicycleListResponse> {
        return apiClient.get<IBicycleListResponse>('/bicycles/me', { params })
    }

    /**
     * 將自行車標記為已售出
     * @param {string} id - 自行車 ID
     * @returns {Promise<IBicycle>} 更新後的自行車
     */
    public async markAsSold(id: string): Promise<IBicycle> {
        return apiClient.post<IBicycle>(`/bicycles/${id}/mark-as-sold`)
    }

    /**
     * 收藏或取消收藏自行車
     * @param {string} id - 自行車 ID
     * @returns {Promise<{ isFavorite: boolean }>} 是否已收藏
     */
    public async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
        return apiClient.post<{ isFavorite: boolean }>(`/bicycles/${id}/toggle-favorite`)
    }

    /**
     * 獲取當前用戶的收藏自行車列表
     * @param {IBicycleListParams} params - 列表參數
     * @returns {Promise<IBicycleListResponse>} 自行車列表響應
     */
    public async getFavorites(params?: IBicycleListParams): Promise<IBicycleListResponse> {
        return apiClient.get<IBicycleListResponse>('/bicycles/favorites', { params })
    }

    /**
     * 獲取特色自行車列表
     * @param {number} limit - 限制數量
     * @returns {Promise<IBicycle[]>} 自行車列表
     */
    public async getFeaturedBicycles(limit: number = 4): Promise<IBicycle[]> {
        return apiClient.get<IBicycle[]>('/bicycles/featured', { params: { limit } })
    }

    /**
     * 獲取最近添加的自行車列表
     * @param {number} limit - 限制數量
     * @returns {Promise<IBicycle[]>} 自行車列表
     */
    public async getRecentlyAddedBicycles(limit: number = 4): Promise<IBicycle[]> {
        return apiClient.get<IBicycle[]>('/bicycles/recently-added', { params: { limit } })
    }

    /**
     * 上報自行車瀏覽數
     * @param {string} id - 自行車 ID
     * @returns {Promise<void>}
     */
    public async trackView(id: string): Promise<void> {
        return apiClient.post(`/bicycles/${id}/track-view`)
    }

    /**
     * 獲取自行車品牌列表
     * @returns {Promise<string[]>} 品牌列表
     */
    public async getBrands(): Promise<string[]> {
        return apiClient.get<string[]>('/bicycles/brands')
    }

    /**
     * 創建草稿自行車（暫存）
     * @param {IBicycleCreateRequest} data - 自行車創建數據
     * @returns {Promise<IBicycle>} 創建的自行車草稿
     */
    public async createDraft(data: Partial<IBicycleCreateRequest>): Promise<IBicycle> {
        return apiClient.post<IBicycle>('/bicycles/draft', data)
    }

    /**
     * 獲取用戶的草稿自行車列表
     * @returns {Promise<IBicycle[]>} 草稿自行車列表
     */
    public async getDrafts(): Promise<IBicycle[]> {
        return apiClient.get<IBicycle[]>('/bicycles/drafts')
    }

    /**
     * 發布草稿自行車
     * @param {string} id - 草稿 ID
     * @returns {Promise<IBicycle>} 發布的自行車
     */
    public async publishDraft(id: string): Promise<IBicycle> {
        return apiClient.post<IBicycle>(`/bicycles/drafts/${id}/publish`)
    }
}

export const bicycleService = new BicycleService()
export default bicycleService
