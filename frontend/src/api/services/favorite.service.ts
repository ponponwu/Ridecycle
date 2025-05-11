import apiClient from '../client'
import { IBicycle, IBicycleListResponse, IBicycleListParams } from '@/types/bicycle.types'

/**
 * 收藏相關 API 服務
 */
export class FavoriteService {
    /**
     * 獲取收藏列表
     * @param {IBicycleListParams} params - 列表參數
     * @returns {Promise<IBicycleListResponse>} 收藏自行車列表響應
     */
    public async getFavorites(params?: IBicycleListParams): Promise<IBicycleListResponse> {
        return apiClient.get<IBicycleListResponse>('/favorites', { params })
    }

    /**
     * 添加到收藏
     * @param {string} bicycleId - 自行車 ID
     * @returns {Promise<{ success: boolean }>} 操作結果
     */
    public async addToFavorites(bicycleId: string): Promise<{ success: boolean }> {
        return apiClient.post<{ success: boolean }>('/favorites', { bicycle_id: bicycleId })
    }

    /**
     * 從收藏中移除
     * @param {string} bicycleId - 自行車 ID
     * @returns {Promise<{ success: boolean }>} 操作結果
     */
    public async removeFromFavorites(bicycleId: string): Promise<{ success: boolean }> {
        return apiClient.delete<{ success: boolean }>(`/favorites/${bicycleId}`)
    }

    /**
     * 檢查是否已收藏
     * @param {string} bicycleId - 自行車 ID
     * @returns {Promise<{ isFavorite: boolean }>} 是否已收藏
     */
    public async isFavorite(bicycleId: string): Promise<{ isFavorite: boolean }> {
        return apiClient.get<{ isFavorite: boolean }>(`/favorites/check/${bicycleId}`)
    }
}

export const favoriteService = new FavoriteService()
export default favoriteService
