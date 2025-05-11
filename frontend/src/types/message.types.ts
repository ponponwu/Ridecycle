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
    sender: IUserSimple // Changed from senderId to match backend's likely output from .as_json(include: :sender)
    receiver?: IUserSimple // Optional, if backend includes it
    senderId?: string // Can keep if backend also provides flat senderId
    receiverId?: string // Can keep if backend also provides flat receiverId
    content: string
    isOffer?: boolean
    offerAmount?: number
    offerAccepted?: boolean
    createdAt: string // Reverted to camelCase
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
    // isOffer, offerAmount, attachments can be added if supported by backend create
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
