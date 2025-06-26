import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { toast } from '@/hooks/use-toast'
import ChatHeader from '@/components/messages/ChatHeader'
import ConversationSidebar from '@/components/messages/ConversationSidebar'
import MessageList from '@/components/messages/MessageList'
import MessageInput from '@/components/messages/MessageInput'
import SafetyBanner from '@/components/messages/SafetyBanner'
import SellerInfo from '@/components/messages/SellerInfo'
import { messageService } from '@/api'
import { IConversationPreview, IMessage, IUserSimple } from '@/types/message.types'
import { IBicycle, BicycleCondition } from '@/types/bicycle.types'
import { bicycleService } from '@/api'
import { useAuth } from '@/contexts/AuthContext'
import { translateBicycleCondition } from '@/utils/bicycleTranslations'
import { formatPriceNTD } from '@/utils/priceFormatter'

const Messages = () => {
    const { t } = useTranslation()
    const { currentUser } = useAuth()
    const currentUserId = currentUser?.id

    const [searchParams] = useSearchParams()
    const { conversationId: paramConversationId } = useParams<{ conversationId?: string }>()
    const navigate = useNavigate()

    const [conversations, setConversations] = useState<IConversationPreview[]>([])
    const [currentConversationMessages, setCurrentConversationMessages] = useState<IMessage[]>([])
    const [activeConversationUserId, setActiveConversationUserId] = useState<string | null>(null)
    const [currentConvoPreview, setCurrentConvoPreview] = useState<IConversationPreview | null | undefined>(null)
    const [currentBicycle, setCurrentBicycle] = useState<IBicycle | null>(null)

    const [isLoadingConversations, setIsLoadingConversations] = useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [errorConversations, setErrorConversations] = useState<string | null>(null)
    const [errorMessages, setErrorMessages] = useState<string | null>(null)

    const [showOfferPopover, setShowOfferPopover] = useState(false)
    const [showSidebar, setShowSidebar] = useState(true)

    useEffect(() => {
        if (paramConversationId) {
            setActiveConversationUserId(paramConversationId)
        }
    }, [paramConversationId])

    useEffect(() => {
        const loadConversations = async () => {
            try {
                const conversations = await messageService.getConversations()
                setConversations(conversations)
            } catch (error) {
                console.error('Failed to load conversations:', error)
                toast({
                    title: t('error'),
                    description: t('failedToLoadConversations'),
                    variant: 'destructive',
                })
            }
        }

        loadConversations()
    }, [t])

    useEffect(() => {
        console.log(
            'Attempting to find currentConvoPreview. ActiveUserID:',
            activeConversationUserId,
            'Conversations count:',
            conversations.length
        )
        if (activeConversationUserId && conversations.length > 0) {
            const foundConvo = conversations.find((c) => {
                console.log(
                    `Comparing activeUserID (${activeConversationUserId}, type: ${typeof activeConversationUserId}) with convo.withUser.id (${
                        c.withUser.id
                    }, type: ${typeof c.withUser.id})`
                )
                return c.withUser.id.toString() === activeConversationUserId
            })
            console.log('Found convo:', foundConvo)
            setCurrentConvoPreview(foundConvo)
        } else {
            console.log('Setting currentConvoPreview to null because activeUserID or conversations are missing/empty.')
            setCurrentConvoPreview(null)
        }
    }, [activeConversationUserId, conversations])

    useEffect(() => {
        if (!activeConversationUserId) {
            setCurrentConversationMessages([])
            setCurrentBicycle(null)
            return
        }

        const fetchMessagesAndBicycle = async () => {
            setIsLoadingMessages(true)
            setErrorMessages(null)
            try {
                const messages = await messageService.getConversation(activeConversationUserId)
                setCurrentConversationMessages(messages)

                if (currentConvoPreview?.bicycleId && messages.length > 0) {
                    try {
                        const bicycleData = await bicycleService.getBicycleById(
                            currentConvoPreview.bicycleId.toString()
                        )
                        setCurrentBicycle(bicycleData)
                    } catch (bicycleErr) {
                        console.error('Failed to fetch bicycle details for conversation:', bicycleErr)
                        setCurrentBicycle(null)
                    }
                } else if (currentConvoPreview?.bicycleImageUrl && currentConvoPreview?.bicycleTitle) {
                    const withUser = currentConvoPreview.withUser
                    setCurrentBicycle({
                        id: currentConvoPreview.bicycleId || activeConversationUserId,
                        title: currentConvoPreview.bicycleTitle,
                        price: 0,
                        photosUrls: [currentConvoPreview.bicycleImageUrl],
                        brandId: '',
                        transmissionId: '',
                        year: '',
                        bicycleType: '',
                        frameSize: '',
                        description: '',
                        condition: BicycleCondition.BRAND_NEW,
                        location: 'Unknown',
                        contactMethod: '',
                        seller: { id: parseInt(withUser.id, 10) || 0, name: withUser.name, email: undefined },
                        status: 'available',
                        createdAt: '',
                        updatedAt: '',
                        sellerRating: undefined,
                        viewCount: undefined,
                        wheelSize: undefined,
                        color: undefined,
                        material: undefined,
                        suspension: undefined,
                        gears: undefined,
                        weight: undefined,
                        yearsOfUse: undefined,
                        specifications: undefined,
                        conversationCount: undefined,
                        isFavorite: undefined,
                    })
                } else {
                    setCurrentBicycle(null)
                }
            } catch (err) {
                console.error(`Failed to fetch messages for user ${activeConversationUserId}:`, err)
                setErrorMessages(err instanceof Error ? err.message : t('unknownErrorOccurred'))
                setCurrentConversationMessages([])
            } finally {
                setIsLoadingMessages(false)
            }
        }

        if (activeConversationUserId) {
            fetchMessagesAndBicycle()
        }
    }, [activeConversationUserId, currentConvoPreview, t]) // Added t to dependencies as it's used in error messages

    const handleSendMessage = async (messageContent: string) => {
        if (!activeConversationUserId) {
            toast({ title: t('error'), description: t('noActiveConversation'), variant: 'destructive' })
            return
        }
        const recipientId = activeConversationUserId
        const bicycleId = currentConvoPreview?.bicycleId

        if (!bicycleId) {
            toast({ title: t('error'), description: t('cannotSendMessageNoBicycleContext'), variant: 'destructive' })
            return
        }

        try {
            const newMessage = await messageService.sendMessage({
                recipientId: recipientId,
                content: messageContent,
                bicycleId: bicycleId,
            })
            setCurrentConversationMessages((prev) => [...prev, newMessage])
            setConversations((prevConvos) =>
                prevConvos.map((convo) => {
                    if (convo.withUser.id === recipientId) {
                        return {
                            ...convo,
                            lastMessage: {
                                content: newMessage.content,
                                createdAt: newMessage.createdAt,
                                isRead: true,
                                senderId: currentUserId,
                            },
                        }
                    }
                    return convo
                })
            )
            toast({ title: t('messageSent'), description: t('yourMessageHasBeenSent') })
        } catch (err) {
            console.error('Failed to send message:', err)
            toast({
                title: t('errorSendingMessage'),
                description: err instanceof Error ? err.message : t('unknownErrorOccurred'),
                variant: 'destructive',
            })
        }
    }

    const handleAcceptOffer = async (messageId: string) => {
        try {
            const result = await messageService.acceptOffer(messageId)

            // 更新當前對話的訊息列表
            setCurrentConversationMessages((prev) => [
                ...prev.map((msg) =>
                    msg.id === messageId ? { ...msg, offerStatus: 'accepted' as const, offerActive: false } : msg
                ),
                result.responseMessage, // 添加回應訊息
            ])

            // 檢查是否有訂單資訊
            if (result.order && result.order.order_number) {
                toast({
                    title: '出價已接受',
                    description: `您已經接受了這個出價！訂單編號：${result.order.order_number}。請聯繫買家完成交易。`,
                    duration: 8000, // 顯示較長時間
                })
            } else {
                toast({
                    title: '出價已接受',
                    description: '您已經接受了這個出價，請聯繫買家完成交易。',
                })
            }

            // 重新載入腳踏車資訊以更新狀態
            if (currentConvoPreview?.bicycleId) {
                try {
                    const updatedBicycle = await bicycleService.getBicycleById(currentConvoPreview.bicycleId.toString())
                    setCurrentBicycle(updatedBicycle)
                } catch (error) {
                    console.error('Failed to reload bicycle data:', error)
                }
            }
        } catch (error) {
            console.error('Failed to accept offer:', error)
            toast({
                title: t('error'),
                description: '接受出價失敗，請稍後再試',
                variant: 'destructive',
            })
        }
    }

    const handleRejectOffer = async (messageId: string) => {
        try {
            const result = await messageService.rejectOffer(messageId)

            // 更新當前對話的訊息列表
            setCurrentConversationMessages((prev) => [
                ...prev.map((msg) =>
                    msg.id === messageId ? { ...msg, offerStatus: 'rejected' as const, offerActive: false } : msg
                ),
                result.responseMessage, // 添加回應訊息
            ])

            toast({
                title: '出價已拒絕',
                description: '您已經拒絕了這個出價。',
            })
        } catch (error) {
            console.error('Failed to reject offer:', error)
            toast({
                title: t('error'),
                description: '拒絕出價失敗，請稍後再試',
                variant: 'destructive',
            })
        }
    }

    const toggleOfferPopover = () => {
        setShowOfferPopover(!showOfferPopover)
    }

    const handleMakeOffer = async (amount: number) => {
        if (!activeConversationUserId) {
            toast({ title: t('error'), description: t('noActiveConversation'), variant: 'destructive' })
            return
        }
        if (!currentConvoPreview?.bicycleId) {
            toast({ title: t('error'), description: t('cannotMakeOfferNoBicycleContext'), variant: 'destructive' })
            return
        }

        const recipientId = activeConversationUserId
        const bicycleId = currentConvoPreview.bicycleId

        // 檢查是否對自己的腳踏車出價
        // 檢查腳踏車是否屬於當前用戶
        const isOwnBicycle =
            currentBicycle &&
            currentUser &&
            currentBicycle.seller &&
            currentBicycle.seller.id.toString() === currentUser.id.toString()

        if (isOwnBicycle) {
            toast({
                title: t('error'),
                description: '您不能對自己的腳踏車進行出價',
                variant: 'destructive',
            })
            return
        }

        // 檢查腳踏車是否仍然可用
        if (currentBicycle && currentBicycle.status !== 'available') {
            toast({
                title: t('error'),
                description: '此腳踏車已不可購買',
                variant: 'destructive',
            })
            return
        }

        try {
            const offerContent = `${t('offer')}: ${formatPriceNTD(amount)}`
            const offerMessage = await messageService.sendMessage({
                recipientId: recipientId,
                content: offerContent,
                bicycleId: bicycleId,
                isOffer: true,
                offerAmount: amount,
            })
            const uiOfferMessage = { ...offerMessage, isOffer: true, offerAmount: amount }
            setCurrentConversationMessages((prev) => [...prev, uiOfferMessage])
            setConversations((prevConvos) =>
                prevConvos.map((convo) => {
                    if (convo.withUser.id === recipientId) {
                        return {
                            ...convo,
                            lastMessage: {
                                content: offerContent,
                                createdAt: offerMessage.createdAt,
                                isRead: true,
                                senderId: currentUserId,
                            },
                        }
                    }
                    return convo
                })
            )
            toast({
                title: t('offerSent'),
                description: `${t('yourOfferFor')} ${formatPriceNTD(amount)} ${t('hasBeenSent')}`,
            })
            setShowOfferPopover(false)
        } catch (err) {
            console.error('Failed to make offer:', err)

            // 處理後端錯誤訊息
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as {
                    response?: {
                        status?: number
                        data?: {
                            errors?: string[] | Array<{ detail?: string; title?: string }>
                        }
                    }
                }

                let errorMessage = t('unknownErrorOccurred')

                if (axiosError.response?.data?.errors?.[0]) {
                    const firstError = axiosError.response.data.errors[0]
                    if (typeof firstError === 'string') {
                        // 傳統錯誤格式
                        errorMessage = firstError
                    } else if (typeof firstError === 'object' && firstError.detail) {
                        // JSON:API 錯誤格式
                        errorMessage = firstError.detail
                    }
                }

                toast({
                    title: t('errorSendingOffer'),
                    description: errorMessage,
                    variant: 'destructive',
                })
            } else {
                toast({
                    title: t('errorSendingOffer'),
                    description: err instanceof Error ? err.message : t('unknownErrorOccurred'),
                    variant: 'destructive',
                })
            }
        }
    }

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar)
    }

    const handleSelectConversation = (selectedWithUserId: string) => {
        setActiveConversationUserId(selectedWithUserId)
        navigate(`/messages/${selectedWithUserId}`, { replace: true })
        if (window.innerWidth < 768) {
            setShowSidebar(false)
        }
    }

    const otherUser = currentConvoPreview?.withUser

    // 檢查腳踏車是否屬於當前用戶
    const isOwnBicycle =
        currentBicycle &&
        currentUser &&
        currentBicycle.seller &&
        currentBicycle.seller.id.toString() === currentUser.id.toString()

    // 調試信息（開發時使用）
    if (currentBicycle && currentUser) {
        console.log('Debug isOwnBicycle check:', {
            currentUserId: currentUser.id,
            currentUserIdType: typeof currentUser.id,
            bicycleSellerId: currentBicycle.seller?.id,
            bicycleSellerIdType: typeof currentBicycle.seller?.id,
            sellerName: currentBicycle.seller?.name,
            isOwnBicycle: isOwnBicycle,
        })
    }

    const displayBicycleData = currentBicycle || {
        id: '',
        title: otherUser ? t('chatWith', { name: otherUser.name }) : t('loadingBicycleInfo'),
        price: 0,
        photosUrls: [otherUser?.avatar || ''],
        brandId: '',
        transmissionId: '',
        year: '',
        bicycleType: '',
        frameSize: '',
        description: '',
        condition: '',
        location: 'N/A',
        contactMethod: '',
        seller: { id: 0, name: otherUser?.name || t('seller'), email: undefined },
        status: 'available',
        createdAt: '',
        updatedAt: '',
        sellerRating: undefined,
        viewCount: undefined,
        wheelSize: undefined,
        color: undefined,
        material: undefined,
        suspension: undefined,
        gears: undefined,
        weight: undefined,
        yearsOfUse: undefined,
        specifications: undefined,
        conversationCount: undefined,
        isFavorite: undefined,
    }

    const otherUserNameForList = otherUser?.name || t('otherUser')

    return (
        <MainLayout>
            <div className="flex h-screen bg-gray-50">
                <ConversationSidebar
                    conversations={conversations.map((c) => {
                        const lastMessage = c.lastMessage
                        let isUnread = false
                        if (lastMessage && lastMessage.isRead === false) {
                            if (lastMessage.senderId && lastMessage.senderId !== currentUserId) {
                                isUnread = true
                            } else if (!lastMessage.senderId) {
                                isUnread = true
                            }
                        }
                        return {
                            id: c.withUser.id,
                            otherUser: c.withUser.name,
                            lastMessage: lastMessage?.content || t('noMessagesYet'),
                            timestamp: lastMessage?.createdAt
                                ? new Date(lastMessage.createdAt)
                                : new Date(c.updatedAt || Date.now()),
                            unread: isUnread,
                            bicycleTitle: c.bicycleTitle || '',
                            bicycleImage: c.bicycleImageUrl || c.withUser.avatar || '',
                        }
                    })}
                    currentConversationId={activeConversationUserId}
                    onSelectConversation={handleSelectConversation}
                    className={`${
                        showSidebar ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-20 w-full sm:w-2/5 md:w-1/3 lg:w-1/4 h-full border-r`}
                />

                <div
                    className={`flex-1 flex flex-col relative ${
                        showSidebar && conversations.length > 0 ? 'hidden md:flex' : 'flex'
                    }`}
                >
                    <button
                        className="md:hidden absolute top-4 left-4 z-30 p-2 bg-white rounded-full shadow"
                        onClick={toggleSidebar}
                        aria-label={showSidebar ? t('closeSidebar') : t('openSidebar')}
                    >
                        <ArrowLeft
                            className={`h-5 w-5 text-gray-600 transition-transform ${showSidebar ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {activeConversationUserId ? (
                        <>
                            <ChatHeader
                                bicycleName={displayBicycleData.title}
                                bicycleImage={displayBicycleData.photosUrls[0]}
                                bicyclePrice={displayBicycleData.price}
                                bicycleId={currentBicycle?.id || currentConvoPreview?.bicycleId}
                                currency="$"
                                onBack={() => {
                                    setActiveConversationUserId(null)
                                    navigate('/messages')
                                }}
                            />

                            <SafetyBanner />

                            {otherUser && (
                                <SellerInfo
                                    name={otherUser.name}
                                    location={currentBicycle?.location || t('unknownLocation')}
                                    currency="$"
                                />
                            )}

                            <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                                {isLoadingMessages && (
                                    <div className="text-center py-10">{t('loadingMessages')}...</div>
                                )}
                                {errorMessages && <div className="text-center py-10 text-red-500">{errorMessages}</div>}
                                {!isLoadingMessages && !errorMessages && currentConversationMessages.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">
                                        {t('noMessagesInThisConversationYet')}
                                    </div>
                                )}
                                {!isLoadingMessages && !errorMessages && currentConversationMessages.length > 0 && (
                                    <MessageList
                                        messages={currentConversationMessages.map((msg) => {
                                            const parsedDate = new Date(msg.createdAt)
                                            const timestamp = isNaN(parsedDate.getTime()) ? new Date() : parsedDate
                                            if (isNaN(parsedDate.getTime())) {
                                                console.warn(
                                                    `Invalid date string received for message ID ${msg.id}: ${msg.createdAt}. Using current date as fallback.`
                                                )
                                            }
                                            return {
                                                id: msg.id.toString(),
                                                sender: msg.sender.id.toString(),
                                                message: msg.content,
                                                timestamp: timestamp,
                                                isOffer: msg.isOffer,
                                                offerAmount: msg.offerAmount,
                                                offerStatus: msg.offerStatus,
                                                offerActive: msg.offerActive,
                                                accepted: msg.offerAccepted,
                                            }
                                        })}
                                        currentUserId={currentUserId?.toString() || ''}
                                        otherUserName={otherUserNameForList}
                                        onAcceptOffer={handleAcceptOffer}
                                        onRejectOffer={handleRejectOffer}
                                    />
                                )}
                            </div>

                            <MessageInput
                                onSendMessage={handleSendMessage}
                                onMakeOffer={handleMakeOffer}
                                showOfferPopover={showOfferPopover}
                                toggleOfferPopover={toggleOfferPopover}
                                originalPrice={displayBicycleData.price}
                                isOwnBicycle={isOwnBicycle}
                                bicycleStatus={currentBicycle?.status || 'available'}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                            {isLoadingConversations ? (
                                <p>{t('loadingConversations')}...</p>
                            ) : conversations.length > 0 ? (
                                <p>{t('selectAConversationToStartChatting')}</p>
                            ) : (
                                <p>{t('youHaveNoConversations')}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}

export default Messages
