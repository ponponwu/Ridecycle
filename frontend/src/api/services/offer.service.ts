import apiClient from '../client'

/**
 * 報價相關介面
 */
export interface IOffer {
    id: string
    bicycleId: string
    buyerId: string
    sellerId: string
    amount: number
    status: 'pending' | 'accepted' | 'rejected'
    createdAt: string
    updatedAt: string
}

/**
 * 創建報價請求
 */
export interface ICreateOfferRequest {
    bicycleId: string
    amount: number
}

/**
 * 報價相關 API 服務
 */
export class OfferService {
    /**
     * 獲取自行車的報價列表
     * @param {string} bicycleId - 自行車 ID
     * @returns {Promise<IOffer[]>} 報價列表
     */
    public async getOffers(bicycleId: string): Promise<IOffer[]> {
        return apiClient.get<IOffer[]>(`/bicycles/${bicycleId}/offers`)
    }

    /**
     * 提交報價
     * @param {ICreateOfferRequest} data - 報價數據
     * @returns {Promise<IOffer>} 創建的報價
     */
    public async makeOffer(data: ICreateOfferRequest): Promise<IOffer> {
        return apiClient.post<IOffer>(`/bicycles/${data.bicycleId}/offers`, { amount: data.amount })
    }

    /**
     * 接受報價
     * @param {string} offerId - 報價 ID
     * @returns {Promise<IOffer>} 更新後的報價
     */
    public async acceptOffer(offerId: string): Promise<IOffer> {
        return apiClient.post<IOffer>(`/offers/${offerId}/accept`)
    }

    /**
     * 拒絕報價
     * @param {string} offerId - 報價 ID
     * @returns {Promise<IOffer>} 更新後的報價
     */
    public async rejectOffer(offerId: string): Promise<IOffer> {
        return apiClient.post<IOffer>(`/offers/${offerId}/reject`)
    }

    /**
     * 獲取用戶發出的報價
     * @returns {Promise<IOffer[]>} 報價列表
     */
    public async getSentOffers(): Promise<IOffer[]> {
        return apiClient.get<IOffer[]>('/offers/sent')
    }

    /**
     * 獲取用戶收到的報價
     * @returns {Promise<IOffer[]>} 報價列表
     */
    public async getReceivedOffers(): Promise<IOffer[]> {
        return apiClient.get<IOffer[]>('/offers/received')
    }
}

export const offerService = new OfferService()
export default offerService
