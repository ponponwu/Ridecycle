// src/types/message.types.ts
export interface IUserSimple {
    // Added export
    // Simple user info for messages/conversations
    id: string
    name: string
    avatar?: string
}

/**
 * 消息介面
 */
export interface IMessage {
    id: string
    // conversationId might not be directly available if messages are fetched per user pair
    sender: {
        id: string
        name: string
        full_name?: string
        email?: string
        avatar_url?: string
    }
    receiver?: IUserSimple // Optional, if backend includes it
    senderId?: string // Can keep if backend also provides flat senderId
    receiverId?: string // Can keep if backend also provides flat receiverId
    content: string
    createdAt: string
    readAt?: string
    isOffer?: boolean // 是否為出價訊息
    offerAmount?: number // 出價金額
    formattedOfferAmount?: string // 格式化的出價金額（從後端回傳）
    offerStatus?: 'pending' | 'accepted' | 'rejected' | 'expired' // 出價狀態
    offerStatusText?: string // 出價狀態的中文顯示
    offerActive?: boolean // 出價是否仍有效
    offerAccepted?: boolean // 出價是否被接受（向後兼容）
    isRead?: boolean
    attachments?: IMessageAttachment[]
    bicycleId?: string // Reverted to camelCase
}

/**
 * 消息附件介面
 */
export interface IMessageAttachment {
    id: string
    messageId: string
    fileUrl: string
    fileName: string
    fileType: string
    fileSize: number
}

/**
 * 對話預覽介面 (for listing conversations)
 * This matches the structure from MessagesController#index
 */
export interface IConversationPreview {
    withUser: IUserSimple // Changed from with_user
    lastMessage: {
        content: string
        createdAt: string // Changed from created_at
        isRead?: boolean
        senderId?: string // Added senderId to last_message for unread logic
    } | null
    updatedAt: string | null // Changed from updated_at
    bicycleId?: string // Changed from bicycle_id
    bicycleTitle?: string // Changed from bicycle_title
    bicycleImageUrl?: string // Changed from bicycle_image_url
}

/**
 * 創建消息請求介面 (for POST /api/v1/messages)
 * Matches backend message_params: receiver_id, content, bicycle_id
 */
export interface ICreateMessageRequest {
    recipientId: string // Changed from recipient_id
    content: string
    bicycleId?: string // Changed from bicycle_id
    isOffer?: boolean // 是否為出價訊息
    offerAmount?: number // 出價金額
    // attachments can be added if supported by backend create
}

// The IConversation, IConversationListParams, IConversationListResponse,
// ICreateConversationRequest might need to be re-evaluated or removed if
// the backend primarily works with IConversationPreview and direct messages (IMessage[]).
// For now, let's assume IConversationPreview is what MessagesController#index returns.
// And MessagesController#show returns IMessage[].

/**
 * 標記消息為已讀請求介面 (Example, if needed)
 */
export interface IMarkAsReadRequest {
    conversationId: string
    messageIds?: string[]
}

/**
 * 接受報價請求介面
 */
export interface IAcceptOfferRequest {
    messageId: string
}

/**
 * 訂單介面
 */
export interface IOrder {
    id: string
    order_number: string
    total_price: number
    status: string
    payment_status: string
    created_at: string
    updated_at: string
}

/**
 * 接受出價回應介面
 */
export interface IAcceptOfferResponse {
    acceptedOffer: IMessage
    responseMessage: IMessage
    order?: IOrder // 訂單資訊
}

/**
 * 拒絕出價回應介面
 */
export interface IRejectOfferResponse {
    rejectedOffer: IMessage
    responseMessage: IMessage
}
