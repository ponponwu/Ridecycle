// src/types/message.types.ts
/**
 * 消息介面
 */
export interface IMessage {
    id: string
    conversationId: string
    senderId: string
    content: string
    isOffer?: boolean
    offerAmount?: number
    offerAccepted?: boolean
    createdAt: string
    isRead: boolean
    attachments?: IMessageAttachment[]
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
 * 對話介面
 */
export interface IConversation {
    id: string
    bicycleId: string
    buyerId: string
    sellerId: string
    lastMessage?: string
    lastMessageTime?: string
    unreadCount: number
    createdAt: string
    updatedAt: string
    isArchived: boolean
    bicycle: {
        id: string
        title: string
        price: number
        photos: string[]
        status: string
    }
    otherUser: {
        id: string
        fullName: string
        avatar?: string
    }
}

/**
 * 創建消息請求介面
 */
export interface ICreateMessageRequest {
    conversationId: string
    content: string
    isOffer?: boolean
    offerAmount?: number
    attachments?: File[]
}

/**
 * 對話列表參數介面
 */
export interface IConversationListParams {
    page?: number
    limit?: number
    bicycleId?: string
    isArchived?: boolean
}

/**
 * 對話列表響應介面
 */
export interface IConversationListResponse {
    conversations: IConversation[]
    totalCount: number
    page: number
    limit: number
    totalPages: number
}

/**
 * 創建對話請求介面
 */
export interface ICreateConversationRequest {
    bicycleId: string
    initialMessage: string
}

/**
 * 標記消息為已讀請求介面
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
