// src/api/services/message.service.ts
import apiClient from '../client'
import {
    IMessage,
    ICreateMessageRequest, // This is the one for sending a message
    IMarkAsReadRequest,
    IAcceptOfferRequest,
    IConversationPreview,
    IUserSimple,
} from '@/types/message.types'

/**
 * 消息相關 API 服務
 */
export class MessageService {
    /**
     * 獲取對話列表
     * @param {IConversationListParams} params - 列表參數
     * @returns {Promise<IConversationPreview[]>} 對話預覽列表響應
     */
    public async getConversationPreviews(params?: { page?: number; limit?: number }): Promise<IConversationPreview[]> {
        // Backend currently returns an array directly, not an IConversationListResponse object.
        // If pagination is added to backend for this endpoint, this will need to change.
        return apiClient.get<IConversationPreview[]>('messages', { params })
    }

    /**
     * 獲取與特定用戶的消息列表
     * @param {string} otherUserId - 對方用戶 ID
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise<IMessage[]>} 消息列表 (no pagination object from backend yet for this)
     */
    public async getMessagesWithUser(
        otherUserId: string,
        params?: { page?: number; limit?: number }
    ): Promise<IMessage[]> {
        // Backend currently returns an array of messages directly.
        return apiClient.get<IMessage[]>(`messages/${otherUserId}`, { params })
    }

    /**
     * 發送消息
     * @param {ICreateMessageRequest} data - 消息創建數據 (receiver_id, content, bicycle_id?)
     * @returns {Promise<IMessage>} 創建的消息
     */
    public async sendMessage(data: ICreateMessageRequest): Promise<IMessage> {
        // Backend expects params nested under 'message' key
        const payload: { message: ICreateMessageRequest } = { message: data }

        // Attachments are not handled in the current ICreateMessageRequest or backend message_params
        // If attachments are needed, ICreateMessageRequest and backend need to support it,
        // and FormData would be required here.
        // For now, assuming no attachments and sending JSON.
        return apiClient.post<IMessage>('messages', payload)
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

    // Removed archiveConversation and unarchiveConversation as backend doesn't support them yet,
    // and IConversation type was removed/simplified.

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
