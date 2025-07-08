import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { adminService, IAdminMessage } from '@/services/admin.service'
import { Message, transformMessageData, getConversationId } from '@/utils/messageUtils'
import ConversationList from './messages/ConversationList'
import ConversationDetail from './messages/ConversationDetail'
import AdminLayout from '@/components/admin/AdminLayout'

const MessageManagement: React.FC = () => {
    const { t } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedChat, setSelectedChat] = useState<string | null>(null)
    const [chatMessages, setChatMessages] = useState<Message[]>([])

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        setLoading(true)
        try {
            const response = await adminService.getMessages({ limit: 100 })
            console.log('Raw messages response:', response)

            const rawMessages = Array.isArray(response.data) ? (response.data as IAdminMessage[]) : []

            const transformedData: Message[] = rawMessages.map((msg: IAdminMessage) => {
                console.log('Processing message:', msg)

                return {
                    id: msg.id.toString(),
                    sender: {
                        id: msg.senderId.toString(),
                        name: msg.senderName || `用戶 ${msg.senderId}`,
                        full_name: msg.senderName || `用戶 ${msg.senderId}`,
                    },
                    receiver: {
                        id: msg.receiverId.toString(),
                        name: msg.recipientName || `用戶 ${msg.receiverId}`,
                        avatar: undefined,
                    },
                    senderId: msg.senderId.toString(),
                    receiverId: msg.receiverId.toString(),
                    content: msg.content,
                    createdAt: msg.createdAt,
                    readAt: undefined,
                    isOffer: msg.messageType === 'offer',
                    offerAmount: msg.offerAmount,
                    offerStatus: msg.offerStatus as 'pending' | 'accepted' | 'rejected' | 'expired' | undefined,
                    offerActive: msg.offerStatus === 'pending',
                    offerAccepted: msg.offerStatus === 'accepted',
                    isRead: false,
                    bicycleId: msg.bicycleId.toString(),
                }
            })

            setMessages(transformedData)
        } catch (error) {
            console.error('Error fetching messages:', error)
            toast({
                variant: 'destructive',
                title: '錯誤',
                description: '載入訊息失敗',
            })
        } finally {
            setLoading(false)
        }
    }

    const viewConversation = async (bicycleId: string, senderId: string, receiverId: string) => {
        try {
            const response = await adminService.getConversation(bicycleId, senderId, receiverId)
            console.log('Conversation response:', response)

            const rawMessages = Array.isArray(response.data) ? (response.data as IAdminMessage[]) : []

            const transformedData: Message[] = rawMessages.map((msg: IAdminMessage) => {
                return {
                    id: msg.id.toString(),
                    sender: {
                        id: msg.senderId.toString(),
                        name: msg.senderName || `用戶 ${msg.senderId}`,
                        full_name: msg.senderName || `用戶 ${msg.senderId}`,
                    },
                    receiver: {
                        id: msg.receiverId.toString(),
                        name: msg.recipientName || `用戶 ${msg.receiverId}`,
                        avatar: undefined,
                    },
                    senderId: msg.senderId.toString(),
                    receiverId: msg.receiverId.toString(),
                    content: msg.content,
                    createdAt: msg.createdAt,
                    readAt: undefined,
                    isOffer: msg.messageType === 'offer',
                    offerAmount: msg.offerAmount,
                    offerStatus: msg.offerStatus as 'pending' | 'accepted' | 'rejected' | 'expired' | undefined,
                    offerActive: msg.offerStatus === 'pending',
                    offerAccepted: msg.offerStatus === 'accepted',
                    isRead: false,
                    bicycleId: msg.bicycleId.toString(),
                }
            })

            setChatMessages(transformedData)
            setSelectedChat(getConversationId(bicycleId, senderId, receiverId))
        } catch (error) {
            console.error('Error fetching conversation:', error)
            toast({
                variant: 'destructive',
                title: '錯誤',
                description: '載入對話失敗',
            })
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">所有訊息</h1>
                    <p className="text-gray-500">查看和管理用戶訊息</p>
                </div>

                <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">所有訊息</TabsTrigger>
                        <TabsTrigger value="unread">未讀訊息</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        <Card className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Message List */}
                                <div className="lg:col-span-1 border rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 p-3 border-b">
                                        <h3 className="font-medium">對話列表</h3>
                                    </div>

                                    <ConversationList
                                        messages={messages}
                                        loading={loading}
                                        selectedChat={selectedChat}
                                        onSelectConversation={viewConversation}
                                    />
                                </div>

                                {/* Message Detail */}
                                <div className="lg:col-span-2 border rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 p-3 border-b">
                                        <h3 className="font-medium">對話內容</h3>
                                    </div>

                                    <div className="p-4 max-h-[600px] overflow-y-auto">
                                        <ConversationDetail chatMessages={chatMessages} selectedChat={selectedChat} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="unread">
                        <Card className="p-4">
                            <div className="text-center py-8">
                                <p className="text-gray-500">未讀訊息功能即將上線</p>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    )
}

export default MessageManagement
