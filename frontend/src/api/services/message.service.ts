// src/api/services/message.service.ts
import apiClient from '../client'
import {
    IMessage,
    IConversation,
    ICreateMessageRequest,
    IConversationListParams,
    IConversationListResponse,
    ICreateConversationRequest,
    IMarkAsReadRequest,
    IAcceptOfferRequest,
} from '@/types/message.types'

/**
 * 消息相關 API 服務
 */
export class MessageService {
    /**
     * 獲取對話列表
     * @param {IConversationListParams} params - 列表參數
     * @returns {Promise<IConversationListResponse>} 對話列表響應
     */
    public async getConversations(params?: IConversationListParams): Promise<IConversationListResponse> {
        return apiClient.get<IConversationListResponse>('/conversations', { params })
    }

    /**
     * 獲取對話詳情
     * @param {string} id - 對話 ID
     * @returns {Promise<IConversation>} 對話詳情
     */
    public async getConversationById(id: string): Promise<IConversation> {
        return apiClient.get<IConversation>(`/conversations/${id}`)
    }

    /**
     * 創建新對話
     * @param {ICreateConversationRequest} data - 對話創建數據
     * @returns {Promise<IConversation>} 創建的對話
     */
    public async createConversation(data: ICreateConversationRequest): Promise<IConversation> {
        return apiClient.post<IConversation>('/conversations', data)
    }

    /**
     * 獲取對話的消息列表
     * @param {string} conversationId - 對話 ID
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise<{ messages: IMessage[], totalCount: number, page: number, limit: number, totalPages: number }>} 消息列表響應
     */
    public async getMessages(
        conversationId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{
        messages: IMessage[]
        totalCount: number
        page: number
        limit: number
        totalPages: number
    }> {
        return apiClient.get<{
            messages: IMessage[]
            totalCount: number
            page: number
            limit: number
            totalPages: number
        }>(`/conversations/${conversationId}/messages`, { params: { page, limit } })
    }

    /**
     * 發送消息
     * @param {ICreateMessageRequest} data - 消息創建數據
     * @returns {Promise<IMessage>} 創建的消息
     */
    public async sendMessage(data: ICreateMessageRequest): Promise<IMessage> {
        // 如果有附件，使用 FormData
        if (data.attachments && data.attachments.length > 0) {
            const formData = new FormData()
            formData.append('conversationId', data.conversationId)
            formData.append('content', data.content)

            if (data.isOffer !== undefined) formData.append('isOffer', String(data.isOffer))
            if (data.offerAmount !== undefined) formData.append('offerAmount', String(data.offerAmount))

            data.attachments.forEach((file, index) => {
                formData.append('attachments', file)
            })

            return apiClient.post<IMessage>('/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        }

        // 無附件，使用 JSON
        return apiClient.post<IMessage>('/messages', data)
    }

    /**
     * 標記消息為已讀
     * @param {IMarkAsReadRequest} data - 標記已讀請求
     * @returns {Promise<{ success: boolean }>} 操作結果
     */
    public async markAsRead(data: IMarkAsReadRequest): Promise<{ success: boolean }> {
        return apiClient.post<{ success: boolean }>('/messages/mark-as-read', data)
    }

    /**
     * 接受報價
     * @param {IAcceptOfferRequest} data - 接受報價請求
     * @returns {Promise<IMessage>} 更新後的消息
     */
    public async acceptOffer(data: IAcceptOfferRequest): Promise<IMessage> {
        return apiClient.post<IMessage>(`/messages/${data.messageId}/accept-offer`)
    }

    /**
     * 拒絕報價
     * @param {IAcceptOfferRequest} data - 拒絕報價請求
     * @returns {Promise<IMessage>} 更新後的消息
     */
    public async rejectOffer(data: IAcceptOfferRequest): Promise<IMessage> {
        return apiClient.post<IMessage>(`/messages/${data.messageId}/reject-offer`)
    }

    /**
     * 歸檔對話
     * @param {string} conversationId - 對話 ID
     * @returns {Promise<IConversation>} 更新後的對話
     */
    public async archiveConversation(conversationId: string): Promise<IConversation> {
        return apiClient.post<IConversation>(`/conversations/${conversationId}/archive`)
    }

    /**
     * 取消歸檔對話
     * @param {string} conversationId - 對話 ID
     * @returns {Promise<IConversation>} 更新後的對話
     */
    public async unarchiveConversation(conversationId: string): Promise<IConversation> {
        return apiClient.post<IConversation>(`/conversations/${conversationId}/unarchive`)
    }

    /**
     * 獲取未讀消息計數
     * @returns {Promise<{ count: number }>} 未讀消息數量
     */
    public async getUnreadCount(): Promise<{ count: number }> {
        return apiClient.get<{ count: number }>('/messages/unread-count')
    }
}

export const messageService = new MessageService()
export default messageService
