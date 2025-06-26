// src/api/services/message.service.ts
import apiClient, { JSONAPIResponse, extractData } from '../client'
import {
    IMessage,
    ICreateMessageRequest, // This is the one for sending a message
    IMarkAsReadRequest,
    IAcceptOfferRequest,
    IAcceptOfferResponse,
    IRejectOfferResponse,
    IConversationPreview,
    IUserSimple,
    IOrder,
} from '@/types/message.types'

/**
 * 消息相關 API 服務
 */
export class MessageService {
    /**
     * 獲取對話列表
     * @returns {Promise<IConversationPreview[]>} 對話預覽列表
     */
    public async getConversations(): Promise<IConversationPreview[]> {
        const response = await apiClient.get<{ conversations: IConversationPreview[] } | IConversationPreview[]>(
            '/messages'
        )

        // 處理後端返回的自定義 JSON:API 格式
        // 格式: { data: { type: 'conversations', attributes: { conversations: [...] } } }
        const extractedData = extractData(response) as
            | { conversations: IConversationPreview[] }
            | IConversationPreview[]

        if (extractedData && typeof extractedData === 'object') {
            // 檢查是否有 conversations 屬性（自定義格式）
            if ('conversations' in extractedData) {
                return extractedData.conversations
            }
            // 檢查是否是直接的陣列格式
            if (Array.isArray(extractedData)) {
                return extractedData
            }
        }

        // 如果都不符合，返回空陣列
        console.warn('Unexpected conversation data format:', extractedData)
        return []
    }

    /**
     * 獲取與特定用戶的對話
     * @param {string} userId - 用戶 ID
     * @returns {Promise<IMessage[]>} 訊息列表
     */
    public async getConversation(userId: string): Promise<IMessage[]> {
        const response = await apiClient.get<IMessage[]>(`/messages/${userId}`)
        return extractData(response) as IMessage[]
    }

    /**
     * 發送訊息
     * @param {ICreateMessageRequest} data - 訊息資料
     * @returns {Promise<IMessage>} 創建的訊息
     */
    public async sendMessage(data: ICreateMessageRequest): Promise<IMessage> {
        // 準備請求數據，根據後端期望的格式調整鍵名
        const payload = {
            message: {
                recipient_id: data.recipientId,
                content: data.content,
                bicycle_id: data.bicycleId,
                is_offer: data.isOffer,
                offer_amount: data.offerAmount,
            },
        }

        const response = await apiClient.post<IMessage>('/messages', payload)
        return extractData(response) as IMessage
    }

    /**
     * 標記消息為已讀
     * @param {string} messageId - 消息 ID
     * @returns {Promise<{ success: boolean }>} 標記結果
     */
    public async markAsRead(messageId: string): Promise<{ success: boolean }> {
        const response = await apiClient.patch<{ success: boolean }>(`/messages/${messageId}/read`)
        return extractData(response) as { success: boolean }
    }

    /**
     * 接受報價
     * @param {string} messageId - 訊息 ID
     * @returns {Promise<IAcceptOfferResponse>} 接受結果
     */
    public async acceptOffer(messageId: string): Promise<IAcceptOfferResponse> {
        const response = await apiClient.post<{
            accepted_offer: { data: { attributes: IMessage } }
            response_message: { data: { attributes: IMessage } }
            order?: { data: { attributes: IOrder } } | null
        }>(`/messages/${messageId}/accept_offer`)

        const extractedData = extractData(response) as {
            accepted_offer: { data: { attributes: IMessage } }
            response_message: { data: { attributes: IMessage } }
            order?: { data: { attributes: IOrder } } | null
        }

        // 提取嵌套的序列化數據
        const acceptedOffer: IMessage = {
            id: extractedData.accepted_offer.data.attributes.id,
            ...extractedData.accepted_offer.data.attributes,
        }

        const responseMessage: IMessage = {
            id: extractedData.response_message.data.attributes.id,
            ...extractedData.response_message.data.attributes,
        }

        const order = extractedData.order
            ? {
                  id: extractedData.order.data.attributes.id,
                  ...extractedData.order.data.attributes,
              }
            : undefined

        return {
            acceptedOffer,
            responseMessage,
            order,
        }
    }

    /**
     * 拒絕報價
     * @param {string} messageId - 訊息 ID
     * @returns {Promise<IRejectOfferResponse>} 拒絕結果
     */
    public async rejectOffer(messageId: string): Promise<IRejectOfferResponse> {
        const response = await apiClient.post<{
            rejected_offer: { data: { attributes: IMessage } }
            response_message: { data: { attributes: IMessage } }
        }>(`/messages/${messageId}/reject_offer`)

        const extractedData = extractData(response) as {
            rejected_offer: { data: { attributes: IMessage } }
            response_message: { data: { attributes: IMessage } }
        }

        // 提取嵌套的序列化數據
        const rejectedOffer: IMessage = {
            id: extractedData.rejected_offer.data.attributes.id,
            ...extractedData.rejected_offer.data.attributes,
        }

        const responseMessage: IMessage = {
            id: extractedData.response_message.data.attributes.id,
            ...extractedData.response_message.data.attributes,
        }

        return {
            rejectedOffer,
            responseMessage,
        }
    }

    /**
     * 檢查是否有待回應的出價
     * @param {string} recipientId - 接收者 ID
     * @param {string} bicycleId - 自行車 ID
     * @returns {Promise<{ hasPending: boolean; existingOffer?: IMessage }>} 檢查結果
     */
    public async checkPendingOffer(
        recipientId: string,
        bicycleId: string
    ): Promise<{ hasPending: boolean; existingOffer?: IMessage }> {
        try {
            const response = await apiClient.get<{ hasPending: boolean; existingOffer?: IMessage }>(
                `/messages/check_pending_offer?recipient_id=${recipientId}&bicycle_id=${bicycleId}`
            )
            return extractData(response) as { hasPending: boolean; existingOffer?: IMessage }
        } catch (error) {
            // 如果端點不存在，返回預設值
            return { hasPending: false }
        }
    }

    // Removed archiveConversation and unarchiveConversation as backend doesn't support them yet,
    // and IConversation type was removed/simplified.

    /**
     * 獲取未讀消息數量
     * @returns {Promise<{ count: number }>} 未讀消息數量
     */
    public async getUnreadCount(): Promise<{ count: number }> {
        const response = await apiClient.get<{ count: number }>('/messages/unread-count')
        return extractData(response) as { count: number }
    }
}

export const messageService = new MessageService()
export default messageService
