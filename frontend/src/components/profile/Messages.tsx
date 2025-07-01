import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MessageCircle, User, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar' // Import Avatar components
import { messageService } from '@/api' // Import messageService
import { IConversationPreview } from '@/types/message.types' // Import IConversationPreview

// Removed sampleConversations

const Messages = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [conversations, setConversations] = useState<IConversationPreview[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setIsLoading(true)
                const data = await messageService.getConversations() // 使用正確的方法名
                // 只取前3個對話作為預覽
                setConversations(data?.slice(0, 3) || [])
                setError(null)
            } catch (err) {
                console.error('Failed to fetch conversation previews:', err)
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError(t('unknownErrorOccurred'))
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchConversations()
    }, [])

    const handleViewConversation = (otherUserId: string) => {
        // Navigate to a page that can display messages with otherUserId
        // For example, /messages/user/:otherUserId or a more general /messages?with=:otherUserId
        navigate(`/messages/${otherUserId}`) // Assuming a route like /messages/:otherUserId exists
    }

    const handleViewAllMessages = () => {
        navigate('/messages') // This likely navigates to a full messages page
    }

    const formatMessageDate = (dateString: string | null | undefined) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } else if (date.toDateString() === yesterday.toDateString()) {
            return t('yesterday')
        } else {
            return date.toLocaleDateString()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t('messages')}</h3>
                <Button variant="ghost" size="sm" onClick={handleViewAllMessages}>
                    {t('viewAll')}
                    <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            </div>

            {isLoading && <div className="text-center py-12">{t('loadingMessages')}...</div>}
            {error && <div className="text-center py-12 text-red-500">{t('error')}: {error}</div>}

            {!isLoading && !error && (
                <>
                    {conversations.length > 0 ? (
                        <div className="space-y-2">
                            {conversations.map((convo) => (
                                <div
                                    key={convo.withUser.id} // Changed from with_user
                                    onClick={() => handleViewConversation(convo.withUser.id)} // Changed from with_user
                                    className="p-3 border rounded-lg flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="relative mr-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage
                                                src={convo.withUser.avatar || convo.bicycleImageUrl} // Changed from with_user and bicycle_image_url
                                                alt={convo.withUser.name} // Changed from with_user
                                            />
                                            <AvatarFallback>
                                                {convo.withUser.name ? convo.withUser.name[0]?.toUpperCase() : 'U'}{' '}
                                                {/* Changed from with_user */}
                                            </AvatarFallback>
                                        </Avatar>
                                        {convo.lastMessage && // Changed from last_message
                                            !convo.lastMessage.isRead && ( // Changed from is_read
                                                <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></div>
                                            )}
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-medium text-sm truncate">{convo.withUser.name}</p>{' '}
                                            {/* Changed from with_user */}
                                            {convo.lastMessage && ( // Changed from last_message
                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                    {formatMessageDate(convo.lastMessage.createdAt)}{' '}
                                                    {/* Changed from created_at */}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">
                                            {convo.lastMessage?.content || t('noMessagesYet')}{' '}
                                            {/* Changed from last_message */}
                                        </p>
                                        {convo.bicycleTitle && ( // Changed from bicycle_title
                                            <p className="text-xs text-gray-400 truncate">
                                                {t('relatedTo')}: {convo.bicycleTitle}{' '}
                                                {/* Changed from bicycle_title */}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border rounded-lg bg-gray-50">
                            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">{t('youHaveNoMessages')}</h3>
                            <p className="mt-2 text-sm text-gray-500">{t('messagesWillAppearHere')}</p>
                            {/* Optional: Button to browse or start a new conversation if applicable */}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Messages
