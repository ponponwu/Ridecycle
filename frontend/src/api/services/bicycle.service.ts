// src/api/services/bicycle.service.ts
import apiClient, { JSONAPIResponse } from '../client'
import {
    IBicycle,
    IBicycleCreateRequest,
    IBicycleUpdateRequest,
    IBicycleListParams,
    IBicycleListResponse,
    // BicycleStatus, // 似乎未使用，暫時註解
} from '@/types/bicycle.types'

// 輔助函數：從 JSONAPIResponse 中提取單一資料
function extractData<T>(response: JSONAPIResponse<T>): T {
    return Array.isArray(response.data) ? response.data[0] : response.data
}

// 輔助函數：從 JSONAPIResponse 中提取陣列資料
function extractArrayData<T>(response: JSONAPIResponse<T | T[]>): T[] {
    if (Array.isArray(response.data)) {
        return response.data as T[]
    }
    return [response.data as T]
}

// 輔助函數：從 JSONAPIResponse 轉換為 IBicycleListResponse 格式
function convertToListResponse(response: JSONAPIResponse<IBicycle | IBicycle[]>): IBicycleListResponse {
    const bicycles = extractArrayData<IBicycle>(response)
    const meta: Record<string, unknown> = response.meta || {}

    return {
        bicycles,
        totalCount: (meta.total_count as number) || 0,
        page: (meta.current_page as number) || 1,
        limit: (meta.per_page as number) || 20,
        totalPages: (meta.total_pages as number) || 0,
    }
}

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
        const response = await apiClient.get<IBicycle | IBicycle[]>('bicycles', { params })
        return convertToListResponse(response)
    }

    /**
     * 獲取自行車詳情
     * @param {string} id - 自行車 ID
     * @returns {Promise<IBicycle>} 自行車詳情
     */
    public async getBicycleById(id: string): Promise<IBicycle> {
        const response = await apiClient.get<IBicycle>(`/bicycles/${id}`)
        return extractData(response)
    }

    /**
     * 創建新自行車列表
     * @param {IBicycleCreateRequest} data - 自行車創建數據
     * @returns {Promise<IBicycle>} 創建的自行車
     */
    public async createBicycle(data: IBicycleCreateRequest): Promise<IBicycle> {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photos' && Array.isArray(value)) {
                value.forEach((photoFile) => {
                    if (photoFile instanceof File) {
                        formData.append(`bicycle[photos][]`, photoFile)
                    }
                })
            } else if (key === 'specifications' && value && typeof value === 'object' && !Array.isArray(value)) {
                formData.append(`bicycle[specifications]`, JSON.stringify(value))
            } else if (value !== undefined && value !== null) {
                formData.append(`bicycle[${key}]`, String(value))
            }
        })
        const response = await apiClient.post<IBicycle>('bicycles', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return extractData(response)
    }

    /**
     * 更新自行車信息
     * @param {string} id - 自行車 ID
     * @param {IBicycleUpdateRequest} data - 自行車更新數據
     * @returns {Promise<IBicycle>} 更新後的自行車
     */
    public async updateBicycle(id: string, data: IBicycleUpdateRequest): Promise<IBicycle> {
        const formData = new FormData()
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key as keyof IBicycleUpdateRequest]
                if (value === undefined || value === null) {
                    continue
                }
                if (key === 'photos' && Array.isArray(value)) {
                    value.forEach((photoFile) => {
                        if (photoFile instanceof File) {
                            formData.append(`bicycle[photos][]`, photoFile)
                        }
                    })
                } else if (key === 'existingPhotos' && Array.isArray(value)) {
                    ;(value as Array<{ id: string; url?: string }>).forEach((photo) => {
                        if (photo && photo.id) {
                            formData.append(`bicycle[existing_photos][]`, photo.id)
                        }
                    })
                } else if (key === 'photosToDelete' && Array.isArray(value)) {
                    ;(value as string[]).forEach((photoId) => {
                        formData.append(`bicycle[photos_to_delete][]`, photoId)
                    })
                } else if (typeof value === 'boolean') {
                    formData.append(`bicycle[${key}]`, value ? 'true' : 'false')
                } else {
                    formData.append(`bicycle[${key}]`, String(value))
                }
            }
        }
        const response = await apiClient.patch<IBicycle>(`/bicycles/${id}`, formData)
        return extractData(response)
    }

    /**
     * 刪除自行車
     * @param {string} id - 自行車 ID
     * @returns {Promise<void>}
     */
    public async deleteBicycle(id: string): Promise<void> {
        await apiClient.delete(`/bicycles/${id}`)
    }

    /**
     * 獲取當前用戶的自行車列表
     * @param {IBicycleListParams} params - 列表參數
     * @returns {Promise<IBicycleListResponse>} 自行車列表響應
     */
    public async getMyBicycles(params?: IBicycleListParams): Promise<IBicycleListResponse> {
        const response = await apiClient.get<IBicycle | IBicycle[]>('/bicycles/me', { params })
        return convertToListResponse(response)
    }

    /**
     * 將自行車標記為已售出
     * @param {string} id - 自行車 ID
     * @returns {Promise<IBicycle>} 更新後的自行車
     */
    public async markAsSold(id: string): Promise<IBicycle> {
        const response = await apiClient.post<IBicycle>(`/bicycles/${id}/mark-as-sold`)
        return extractData(response)
    }

    /**
     * 收藏或取消收藏自行車
     * @param {string} id - 自行車 ID
     * @returns {Promise<{ isFavorite: boolean }>} 是否已收藏
     */
    public async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
        const response = await apiClient.post<{ isFavorite: boolean }>(`/bicycles/${id}/toggle-favorite`)
        return extractData(response)
    }

    /**
     * 獲取當前用戶的收藏自行車列表
     * @param {IBicycleListParams} params - 列表參數
     * @returns {Promise<IBicycleListResponse>} 自行車列表響應
     */
    public async getFavorites(params?: IBicycleListParams): Promise<IBicycleListResponse> {
        const response = await apiClient.get<IBicycle | IBicycle[]>('/bicycles/favorites', { params })
        return convertToListResponse(response)
    }

    /**
     * 獲取特色自行車列表
     * @param {number} limit - 限制數量
     * @returns {Promise<IBicycle[]>} 自行車列表
     */
    public async getFeaturedBicycles(limit: number = 4): Promise<IBicycle[]> {
        const response = await apiClient.get<IBicycle | IBicycle[]>('/bicycles/featured', { params: { limit } })
        return extractArrayData<IBicycle>(response)
    }

    /**
     * 獲取最近添加的自行車列表
     * @param {number} limit - 限制數量
     * @returns {Promise<IBicycle[]>} 自行車列表
     */
    public async getRecentlyAddedBicycles(limit: number = 4): Promise<IBicycle[]> {
        const response = await apiClient.get<IBicycle | IBicycle[]>('/bicycles/recently_added', { params: { limit } })
        return extractArrayData<IBicycle>(response)
    }

    /**
     * 上報自行車瀏覽數
     * @param {string} id - 自行車 ID
     * @returns {Promise<void>}
     */
    public async trackView(id: string): Promise<void> {
        await apiClient.post(`/bicycles/${id}/track-view`)
    }

    /**
     * 獲取草稿列表
     * @returns {Promise<IBicycle[]>} 草稿列表
     */
    // public async getDrafts(): Promise<IBicycle[]> {
    //     const response = await apiClient.get<IBicycle[]>('/bicycles/drafts')
    //     return extractArrayData(response)
    // }

    /**
     * 發布草稿自行車
     * @param {string} id - 草稿 ID
     * @returns {Promise<IBicycle>} 發布的自行車
     */
    public async publishDraft(id: string): Promise<IBicycle> {
        const response = await apiClient.post<IBicycle>(`/bicycles/drafts/${id}/publish`)
        return extractData(response)
    }
}

export const bicycleService = new BicycleService()
export default bicycleService
