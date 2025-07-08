import React from 'react'
import { useTranslation } from 'react-i18next'
import { Message, formatDate, getConversationId } from '@/utils/messageUtils'

interface ConversationListProps {
    messages: Message[]
    loading: boolean
    selectedChat: string | null
    onSelectConversation: (bicycleId: string, senderId: string, receiverId: string) => void
}

const ConversationList: React.FC<ConversationListProps> = ({
    messages,
    loading,
    selectedChat,
    onSelectConversation,
}) => {
    const { t } = useTranslation()

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">沒有找到訊息</p>
            </div>
        )
    }

    // Create a map of unique conversations based on bicycleId, senderId, and receiverId
    const uniqueConversations = [
        ...new Map(
            messages.map((msg) => [
                getConversationId(msg.bicycleId || '', msg.senderId || '', msg.receiverId || ''),
                msg,
            ])
        ).values(),
    ].filter((msg) => msg.bicycleId && msg.senderId && msg.receiverId)

    return (
        <div className="divide-y max-h-[600px] overflow-y-auto">
            {uniqueConversations.map((msg) => (
                <div
                    key={msg.id}
                    onClick={() => onSelectConversation(msg.bicycleId || '', msg.senderId || '', msg.receiverId || '')}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat ===
                        getConversationId(msg.bicycleId || '', msg.senderId || '', msg.receiverId || '')
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : ''
                    }`}
                >
                    <div className="flex justify-between">
                        <p className="font-medium truncate">
                            {msg.sender?.name || `用戶 ${msg.senderId}`} → {msg.receiver?.name || `用戶 ${msg.receiverId}`}
                        </p>
                        <span className="text-xs text-gray-500">{formatDate(msg.createdAt).split(',')[0]}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{msg.content}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">關於：自行車 ID {msg.bicycleId || '未知'}</p>
                </div>
            ))}
        </div>
    )
}

export default ConversationList
