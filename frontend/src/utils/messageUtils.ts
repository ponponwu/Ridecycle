// src/utils/messageUtils.ts
import { IMessage } from '@/types/message.types'

/**
 * Re-export IMessage as Message for backward compatibility
 */
export type Message = IMessage

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