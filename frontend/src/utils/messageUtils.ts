// src/utils/messageUtils.ts
import { IMessage } from '@/types/message.types'

/**
 * Re-export IMessage as Message for backward compatibility
 */
export type Message = IMessage

/**
 * Raw message data structure from Supabase with nested relations
 */
export interface RawMessage {
  id: string
  sender_id: string
  receiver_id: string
  bicycle_id?: string
  content: string
  created_at: string
  read_at?: string
  is_offer?: boolean
  offer_amount?: number
  offer_status?: 'pending' | 'accepted' | 'rejected' | 'expired'
  // Nested relations from Supabase
  sender?: {
    full_name?: string
    name?: string
    id?: string
    email?: string
    avatar_url?: string
  } | null
  receiver?: {
    full_name?: string
    name?: string
    id?: string
    email?: string
    avatar_url?: string
  } | null
  bicycle?: {
    title?: string
    id?: string
  } | null
}

/**
 * Transform raw Supabase message data to frontend Message format
 * @param rawMessage Raw message data from Supabase
 * @returns Transformed Message object
 */
export function transformMessageData(rawMessage: RawMessage): Message {
  return {
    id: rawMessage.id,
    sender: {
      id: rawMessage.sender_id,
      name: rawMessage.sender?.full_name || rawMessage.sender?.name || 'Unknown User',
      full_name: rawMessage.sender?.full_name,
      email: rawMessage.sender?.email,
      avatar_url: rawMessage.sender?.avatar_url
    },
    receiver: rawMessage.receiver ? {
      id: rawMessage.receiver_id,
      name: rawMessage.receiver.full_name || rawMessage.receiver.name || 'Unknown User',
      avatar: rawMessage.receiver.avatar_url
    } : undefined,
    senderId: rawMessage.sender_id,
    receiverId: rawMessage.receiver_id,
    content: rawMessage.content,
    createdAt: rawMessage.created_at,
    readAt: rawMessage.read_at,
    isOffer: rawMessage.is_offer || false,
    offerAmount: rawMessage.offer_amount,
    offerStatus: rawMessage.offer_status,
    offerActive: rawMessage.offer_status === 'pending',
    offerAccepted: rawMessage.offer_status === 'accepted',
    isRead: !!rawMessage.read_at,
    bicycleId: rawMessage.bicycle_id,
    bicycle: rawMessage.bicycle ? {
      title: rawMessage.bicycle.title || 'Unknown Bicycle'
    } : undefined
  }
}

/**
 * Generate a unique conversation ID from bicycle ID and participant IDs
 * @param bicycleId Bicycle ID
 * @param senderId Sender user ID
 * @param receiverId Receiver user ID
 * @returns Unique conversation ID string
 */
export function getConversationId(bicycleId: string, senderId: string, receiverId: string): string {
  // Sort participant IDs to ensure consistent conversation ID regardless of who initiates
  const participants = [senderId, receiverId].sort()
  return `${bicycleId}_${participants[0]}_${participants[1]}`
}

/**
 * Format a date string for display in messages
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return '剛剛'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} 分鐘前`
  } else if (diffInMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} 小時前`
  } else if (diffInMinutes < 10080) { // Less than 7 days
    const days = Math.floor(diffInMinutes / 1440)
    return `${days} 天前`
  } else {
    // Show full date for older messages
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

/**
 * Group messages by conversation
 * @param messages Array of messages
 * @returns Object with conversation IDs as keys and message arrays as values
 */
export function groupMessagesByConversation(messages: Message[]): Record<string, Message[]> {
  const conversations: Record<string, Message[]> = {}
  
  messages.forEach(message => {
    if (message.bicycleId && message.senderId && message.receiverId) {
      const conversationId = getConversationId(message.bicycleId, message.senderId, message.receiverId)
      if (!conversations[conversationId]) {
        conversations[conversationId] = []
      }
      conversations[conversationId].push(message)
    }
  })
  
  // Sort messages within each conversation by timestamp
  Object.keys(conversations).forEach(conversationId => {
    conversations[conversationId].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  })
  
  return conversations
}

/**
 * Get unique conversations from a list of messages
 * @param messages Array of messages
 * @returns Array of conversation summaries
 */
export function getUniqueConversations(messages: Message[]): Array<{
  conversationId: string
  bicycleId: string
  participants: { senderId: string; receiverId: string }
  lastMessage: Message
  bicycleTitle?: string
}> {
  const conversationMap = new Map<string, {
    conversationId: string
    bicycleId: string
    participants: { senderId: string; receiverId: string }
    lastMessage: Message
    bicycleTitle?: string
  }>()
  
  messages.forEach(message => {
    if (message.bicycleId && message.senderId && message.receiverId) {
      const conversationId = getConversationId(message.bicycleId, message.senderId, message.receiverId)
      const existing = conversationMap.get(conversationId)
      
      if (!existing || new Date(message.createdAt) > new Date(existing.lastMessage.createdAt)) {
        conversationMap.set(conversationId, {
          conversationId,
          bicycleId: message.bicycleId,
          participants: {
            senderId: message.senderId,
            receiverId: message.receiverId
          },
          lastMessage: message,
          bicycleTitle: message.bicycle?.title
        })
      }
    }
  })
  
  return Array.from(conversationMap.values()).sort((a, b) => 
    new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  )
}