import React from 'react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'

interface Message {
    id: string // Changed to string to match IMessage.id
    sender: 'buyer' | 'seller' | string // Keep string for flexibility, but ideally 'buyer' | 'seller'
    message: string
    timestamp: Date
    isOffer?: boolean
    offerAmount?: number
    status?: string
    accepted?: boolean
}

interface MessageListProps {
    messages: Message[]
    currentUserId: string // Added currentUserId to determine message alignment
    otherUserName: string // Changed from sellerName for clarity
}

const MessageList = ({ messages, currentUserId, otherUserName }: MessageListProps) => {
    const { t } = useTranslation()

    // Determine who is the 'seller' in the context of this component's rendering logic
    // This is primarily for avatar display. The `msg.sender` ('buyer'/'seller') determines alignment.
    const resolvedSellerName = otherUserName || t('seller')

    if (messages.length === 0) {
        return (
            <Card className="text-center py-10 mb-6">
                <div className="pt-6">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noMessages')}</h3>
                    <p className="mt-2 text-sm text-gray-500">{t('startConversation')}</p>
                </div>
            </Card>
        )
    }

    return (
        <div className="flex flex-col space-y-4 mb-6">
            {messages.map((msg) => {
                // msg.sender here is already 'buyer' or 'seller' based on transformation in Messages.tsx
                const isCurrentUserSender = msg.sender === 'buyer' // Assuming 'buyer' represents the current user in this transformed context

                return (
                    <div key={msg.id} className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
                        {!isCurrentUserSender && ( // Avatar for the other user (seller/receiver)
                            <Avatar className="h-8 w-8 mr-2 self-end">
                                <div className="bg-gray-300 text-gray-700 h-full w-full flex items-center justify-center rounded-full">
                                    {otherUserName ? otherUserName[0]?.toUpperCase() : 'U'}
                                </div>
                            </Avatar>
                        )}
                        <div
                            className={`max-w-[70%] md:max-w-[60%] rounded-lg p-3 shadow-sm ${
                                isCurrentUserSender
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                            }`}
                        >
                            {msg.isOffer && (
                                <div className={`mb-1 ${isCurrentUserSender ? 'text-blue-100' : 'text-gray-600'}`}>
                                    <div className="font-semibold">
                                        {t('offer')}: ${msg.offerAmount?.toLocaleString()}
                                    </div>
                                    {msg.status && (
                                        <div className="text-xs opacity-80">
                                            {msg.status === 'sent' ? t('offerSent') : msg.status}
                                        </div>
                                    )}
                                    {msg.accepted && (
                                        <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                            {t('accepted')}
                                        </span>
                                    )}
                                </div>
                            )}
                            {!msg.isOffer && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}
                            <div
                                className={`text-xs mt-1.5 ${
                                    isCurrentUserSender ? 'text-blue-200 text-right' : 'text-gray-400 text-left'
                                }`}
                            >
                                {format(new Date(msg.timestamp), 'p')}
                            </div>
                        </div>
                        {isCurrentUserSender && ( // Avatar for the current user (buyer/sender)
                            <Avatar className="h-8 w-8 ml-2 self-end">
                                <div className="bg-blue-500 text-white h-full w-full flex items-center justify-center rounded-full">
                                    {/* You might want to use current user's initial here */}
                                    {'Me'[0]}
                                </div>
                            </Avatar>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default MessageList
