import React from 'react'
import { useTranslation } from 'react-i18next'
import { Message, formatDate } from '@/utils/messageUtils'

interface ConversationDetailProps {
    chatMessages: Message[]
    selectedChat: string | null
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({ chatMessages, selectedChat }) => {
    const { t } = useTranslation()

    if (!selectedChat) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">選擇對話以查看內容</p>
            </div>
        )
    }

    if (chatMessages.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">此對話中沒有訊息</p>
            </div>
        )
    }

    // 獲取第一個用戶作為參考，決定左右顯示
    const firstUserId = chatMessages[0]?.senderId

    return (
        <div className="space-y-4">
            {chatMessages.map((msg) => {
                // 如果是第一個用戶發送的訊息，顯示在左邊，否則顯示在右邊
                const isFirstUser = msg.senderId === firstUserId

                return (
                    <div key={msg.id} className={`flex ${isFirstUser ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] ${isFirstUser ? 'mr-4' : 'ml-4'}`}>
                            <div className={`flex items-center mb-1 ${isFirstUser ? 'justify-start' : 'justify-end'}`}>
                                <span className="font-medium text-sm">
                                    {msg.sender?.name || `用戶 ${msg.senderId}`}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">{formatDate(msg.createdAt)}</span>
                            </div>
                            <div
                                className={`p-3 rounded-lg ${
                                    isFirstUser ? 'bg-gray-100 text-gray-900' : 'bg-blue-500 text-white'
                                }`}
                            >
                                {msg.isOffer && msg.offerAmount ? (
                                    <div>
                                        <div className="font-medium mb-1">💰 出價訊息</div>
                                        <div className="text-lg font-bold">NT$ {msg.offerAmount?.toLocaleString()}</div>
                                        {msg.content && <div className="mt-2">{msg.content}</div>}
                                        <div className="text-xs mt-2 opacity-75">
                                            狀態:{' '}
                                            {msg.offerStatus === 'pending'
                                                ? '待回應'
                                                : msg.offerStatus === 'accepted'
                                                ? '已接受'
                                                : msg.offerStatus === 'rejected'
                                                ? '已拒絕'
                                                : '未知'}
                                        </div>
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ConversationDetail
