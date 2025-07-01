import React from 'react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Check, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import OfferStatusBadge from './OfferStatusBadge'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface Message {
    id: string
    sender: string
    message: string
    timestamp: Date
    isOffer?: boolean
    offerAmount?: number
    offerStatus?: 'pending' | 'accepted' | 'rejected' | 'expired'
    offerActive?: boolean
    accepted?: boolean
}

interface MessageListProps {
    messages: Message[]
    currentUserId: string
    otherUserName: string
    onAcceptOffer?: (messageId: string) => void
    onRejectOffer?: (messageId: string) => void
}

const MessageList = ({ messages, currentUserId, otherUserName, onAcceptOffer, onRejectOffer }: MessageListProps) => {
    const { t } = useTranslation()

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
                const isCurrentUserSender = msg.sender === currentUserId
                const canRespondToOffer =
                    msg.isOffer && !isCurrentUserSender && msg.offerActive && msg.offerStatus === 'pending'

                return (
                    <div key={msg.id} className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
                        {!isCurrentUserSender && (
                            <Avatar className="h-8 w-8 mr-2 self-end">
                                <div className="bg-gray-300 text-gray-700 h-full w-full flex items-center justify-center rounded-full">
                                    {otherUserName ? otherUserName[0]?.toUpperCase() : 'U'}
                                </div>
                            </Avatar>
                        )}
                        <div className="max-w-[70%] md:max-w-[60%] space-y-2">
                            <div
                                className={`rounded-lg p-3 shadow-sm ${
                                    isCurrentUserSender
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                }`}
                            >
                                {msg.isOffer && msg.offerAmount ? (
                                    <div>
                                        <div
                                            className={`flex items-center gap-2 mb-2 ${
                                                isCurrentUserSender ? 'text-blue-100' : 'text-gray-600'
                                            }`}
                                        >
                                            <span className="font-semibold">
                                                {t('offer')}: {formatPriceNTD(msg.offerAmount)}
                                            </span>
                                            {msg.offerStatus && (
                                                <OfferStatusBadge
                                                    status={msg.offerStatus}
                                                    isActive={msg.offerStatus === 'pending'}
                                                />
                                            )}
                                        </div>
                                        <p className="whitespace-pre-wrap break-words text-sm opacity-90">
                                            {msg.message}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                )}
                                <div
                                    className={`text-xs mt-1.5 ${
                                        isCurrentUserSender ? 'text-blue-200 text-right' : 'text-gray-400 text-left'
                                    }`}
                                >
                                    {format(new Date(msg.timestamp), 'p')}
                                </div>
                            </div>

                            {/* 出價操作按鈕 */}
                            {canRespondToOffer && onAcceptOffer && onRejectOffer && (
                                <div className="flex gap-2 pl-2">
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => onAcceptOffer(msg.id)}
                                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Check className="h-3 w-3" />
                                        {t('messagesPage.acceptOffer')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onRejectOffer(msg.id)}
                                        className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        <X className="h-3 w-3" />
                                        {t('messagesPage.rejectOffer')}
                                    </Button>
                                </div>
                            )}
                        </div>
                        {isCurrentUserSender && (
                            <Avatar className="h-8 w-8 ml-2 self-end">
                                <div className="bg-blue-500 text-white h-full w-full flex items-center justify-center rounded-full">
                                    {t('messagesPage.me')[0]}
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
