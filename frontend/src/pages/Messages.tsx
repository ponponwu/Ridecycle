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
        const fetchConversations = async () => {
            setIsLoadingConversations(true)
            try {
                const data = await messageService.getConversationPreviews({})
                setConversations(data || [])
                setErrorConversations(null)
            } catch (err) {
                console.error('Failed to fetch conversation previews:', err)
                setErrorConversations(err instanceof Error ? err.message : t('unknownErrorOccurred'))
            } finally {
                setIsLoadingConversations(false)
            }
        }
        fetchConversations()
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
                const messagesData = await messageService.getMessagesWithUser(activeConversationUserId, {})
                setCurrentConversationMessages(messagesData || [])

                if (currentConvoPreview?.bicycleId) {
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
                        user: { id: parseInt(withUser.id, 10) || 0, name: withUser.name, email: undefined },
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
        const currencySymbol = '$'

        try {
            const offerContent = `${t('offer')}: ${currencySymbol}${amount.toLocaleString()}`
            const offerMessage = await messageService.sendMessage({
                recipientId: recipientId,
                content: offerContent,
                bicycleId: bicycleId,
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
                description: `${t('yourOfferFor')} ${currencySymbol}${amount.toLocaleString()} ${t('hasBeenSent')}`,
            })
            setShowOfferPopover(false)
        } catch (err) {
            console.error('Failed to make offer:', err)
            toast({
                title: t('errorSendingOffer'),
                description: err instanceof Error ? err.message : t('unknownErrorOccurred'),
                variant: 'destructive',
            })
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
        user: { id: 0, name: otherUser?.name || t('seller'), email: undefined },
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
                                                sender: msg.sender.id === currentUserId ? 'buyer' : 'seller',
                                                message: msg.content,
                                                timestamp: timestamp,
                                                isOffer: msg.isOffer,
                                                offerAmount: msg.offerAmount,
                                                accepted: msg.offerAccepted,
                                            }
                                        })}
                                        currentUserId={currentUserId || ''}
                                        otherUserName={otherUserNameForList}
                                    />
                                )}
                            </div>

                            <MessageInput
                                onSendMessage={handleSendMessage}
                                onMakeOffer={handleMakeOffer}
                                showOfferPopover={showOfferPopover}
                                toggleOfferPopover={toggleOfferPopover}
                                originalPrice={displayBicycleData.price}
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
