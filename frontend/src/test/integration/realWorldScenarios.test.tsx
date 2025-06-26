/**
 * 前端真實情境整合測試
 * 測試各種真實使用情境
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import App from '../../App'

// Mock 不同類型的使用者和情境
const mockUsers = {
    newbie: {
        id: '1',
        name: '新手買家',
        email: 'newbie@test.com',
    },
    experienced: {
        id: '2',
        name: '資深車友',
        email: 'experienced@test.com',
    },
    seller: {
        id: '3',
        name: '腳踏車賣家',
        email: 'seller@test.com',
    },
    collector: {
        id: '4',
        name: '收藏家',
        email: 'collector@test.com',
    },
}

const mockBicycles = {
    entry: {
        id: '1',
        title: '入門款公路車',
        description: '適合新手的公路車',
        price: 8000,
        condition: 'fair',
        size: 'M',
        seller: mockUsers.seller,
        photos: [{ url: 'http://example.com/entry.jpg' }],
    },
    premium: {
        id: '2',
        title: '高階碳纖維公路車',
        description: '競賽級碳纖維車架',
        price: 150000,
        condition: 'excellent',
        size: 'L',
        seller: mockUsers.collector,
        photos: [{ url: 'http://example.com/premium.jpg' }],
    },
    vintage: {
        id: '3',
        title: '復古鋼管車',
        description: '1980年代經典車款',
        price: 25000,
        condition: 'good',
        size: 'M',
        seller: mockUsers.experienced,
        photos: [{ url: 'http://example.com/vintage.jpg' }],
    },
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>{children}</AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

describe('真實情境整合測試', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
        user = userEvent.setup()
        vi.clearAllMocks()
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    describe('新手買家情境', () => {
        it('第一次買車的新手使用者體驗', async () => {
            // Mock API responses for newbie scenario
            const authService = await import('../../api/services/auth.service')
            const bicycleService = await import('../../api/services/bicycle.service')
            const messageService = await import('../../api/services/message.service')

            vi.spyOn(authService, 'login').mockResolvedValue({
                user: mockUsers.newbie,
                token: 'newbie-token',
            })

            vi.spyOn(bicycleService, 'getAllBicycles').mockResolvedValue({
                data: [mockBicycles.entry, mockBicycles.vintage],
                total: 2,
                page: 1,
                limit: 10,
            })

            vi.spyOn(bicycleService, 'getBicycleById').mockResolvedValue(mockBicycles.entry)

            render(<App />, { wrapper: TestWrapper })

            // 新手登入
            const loginButton = await screen.findByText('登入')
            await user.click(loginButton)

            await user.type(screen.getByLabelText(/email/i), 'newbie@test.com')
            await user.type(screen.getByLabelText(/password/i), 'password123')
            await user.click(screen.getByRole('button', { name: /登入/i }))

            // 瀏覽商品，新手可能會被價格嚇到
            await waitFor(() => {
                expect(screen.getByText('入門款公路車')).toBeInTheDocument()
                expect(screen.getByText('復古鋼管車')).toBeInTheDocument()
            })

            // 新手選擇入門款（較便宜）
            await user.click(screen.getByText('入門款公路車'))

            await waitFor(() => {
                expect(bicycleService.getBicycleById).toHaveBeenCalledWith('1')
            })

            // 新手可能會猶豫，先詢問而不是直接出價
            const messageButton = await screen.findByText(/詢問|message/i)
            await user.click(messageButton)

            await user.type(screen.getByLabelText(/訊息/i), '這台車適合新手嗎？保養狀況如何？')

            vi.spyOn(messageService, 'sendMessage').mockResolvedValue({
                id: '1',
                content: '這台車適合新手嗎？保養狀況如何？',
                is_offer: false,
                sender: mockUsers.newbie,
                recipient: mockUsers.seller,
                bicycle: mockBicycles.entry,
                created_at: new Date().toISOString(),
            })

            const sendButton = screen.getByRole('button', { name: /送出/i })
            await user.click(sendButton)

            await waitFor(() => {
                expect(messageService.sendMessage).toHaveBeenCalledWith({
                    recipient_id: '3',
                    bicycle_id: '1',
                    content: '這台車適合新手嗎？保養狀況如何？',
                    is_offer: false,
                })
            })
        })

        it('新手出價過程 - 小心謹慎的砍價', async () => {
            const messageService = await import('../../api/services/message.service')

            // 模擬新手已經和賣家聊過，現在要出價
            vi.spyOn(messageService, 'sendMessage').mockResolvedValue({
                id: '2',
                content: '可以7000成交嗎？我是新手預算有限',
                is_offer: true,
                offer_amount: 7000,
                offer_status: 'pending',
                sender: mockUsers.newbie,
                recipient: mockUsers.seller,
                bicycle: mockBicycles.entry,
                created_at: new Date().toISOString(),
            })

            render(<App />, { wrapper: TestWrapper })

            // 模擬已在商品頁面
            const makeOfferButton = await screen.findByText(/出價/i)
            await user.click(makeOfferButton)

            // 新手出價會比較保守
            const offerInput = screen.getByLabelText(/出價金額/i)
            await user.type(offerInput, '7000')

            const messageInput = screen.getByLabelText(/訊息/i)
            await user.type(messageInput, '可以7000成交嗎？我是新手預算有限')

            const submitButton = screen.getByRole('button', { name: /送出出價/i })
            await user.click(submitButton)

            await waitFor(() => {
                expect(messageService.sendMessage).toHaveBeenCalledWith({
                    recipient_id: '3',
                    bicycle_id: '1',
                    content: '可以7000成交嗎？我是新手預算有限',
                    is_offer: true,
                    offer_amount: 7000,
                })
            })

            // 驗證出價成功訊息
            await waitFor(() => {
                expect(screen.getByText(/出價已送出/i)).toBeInTheDocument()
            })
        })
    })

    describe('資深車友情境', () => {
        it('資深車友快速決策購買流程', async () => {
            const authService = await import('../../api/services/auth.service')
            const bicycleService = await import('../../api/services/bicycle.service')
            const messageService = await import('../../api/services/message.service')

            vi.spyOn(authService, 'login').mockResolvedValue({
                user: mockUsers.experienced,
                token: 'experienced-token',
            })

            vi.spyOn(bicycleService, 'getBicycleById').mockResolvedValue(mockBicycles.vintage)

            vi.spyOn(messageService, 'sendMessage').mockResolvedValue({
                id: '3',
                content: '原價收購，台北可約',
                is_offer: true,
                offer_amount: 25000,
                offer_status: 'pending',
                sender: mockUsers.experienced,
                recipient: mockUsers.experienced,
                bicycle: mockBicycles.vintage,
                created_at: new Date().toISOString(),
            })

            render(<App />, { wrapper: TestWrapper })

            // 資深車友登入
            const loginButton = await screen.findByText('登入')
            await user.click(loginButton)

            await user.type(screen.getByLabelText(/email/i), 'experienced@test.com')
            await user.type(screen.getByLabelText(/password/i), 'password123')
            await user.click(screen.getByRole('button', { name: /登入/i }))

            // 直接查看目標商品（復古車）
            await waitFor(() => {
                expect(bicycleService.getBicycleById).toHaveBeenCalledWith('3')
            })

            // 資深車友看到好車會快速出價
            const makeOfferButton = await screen.findByText(/出價/i)
            await user.click(makeOfferButton)

            // 直接出原價或接近原價
            await user.type(screen.getByLabelText(/出價金額/i), '25000')
            await user.type(screen.getByLabelText(/訊息/i), '原價收購，台北可約')

            const submitButton = screen.getByRole('button', { name: /送出出價/i })
            await user.click(submitButton)

            await waitFor(() => {
                expect(messageService.sendMessage).toHaveBeenCalledWith({
                    recipient_id: '2',
                    bicycle_id: '3',
                    content: '原價收購，台北可約',
                    is_offer: true,
                    offer_amount: 25000,
                })
            })
        })
    })

    describe('收藏家情境', () => {
        it('收藏家對高價商品的精密評估', async () => {
            const bicycleService = await import('../../api/services/bicycle.service')
            const messageService = await import('../../api/services/message.service')

            vi.spyOn(bicycleService, 'getBicycleById').mockResolvedValue(mockBicycles.premium)

            render(<App />, { wrapper: TestWrapper })

            // 收藏家查看高價商品
            await waitFor(() => {
                expect(screen.getByText('高階碳纖維公路車')).toBeInTheDocument()
                expect(screen.getByText('150,000')).toBeInTheDocument()
            })

            // 收藏家會詳細詢問規格
            const messageButton = await screen.findByText(/詢問/i)
            await user.click(messageButton)

            const detailedQuestions = [
                '請問車架年份？',
                '變速器是什麼等級？',
                '輪組是原廠還是升級過？',
                '有保固或購買證明嗎？',
            ]

            for (const question of detailedQuestions) {
                vi.spyOn(messageService, 'sendMessage').mockResolvedValue({
                    id: Math.random().toString(),
                    content: question,
                    is_offer: false,
                    sender: mockUsers.collector,
                    recipient: mockUsers.collector,
                    bicycle: mockBicycles.premium,
                    created_at: new Date().toISOString(),
                })

                await user.clear(screen.getByLabelText(/訊息/i))
                await user.type(screen.getByLabelText(/訊息/i), question)
                await user.click(screen.getByRole('button', { name: /送出/i }))

                await waitFor(() => {
                    expect(messageService.sendMessage).toHaveBeenCalledWith({
                        recipient_id: '4',
                        bicycle_id: '2',
                        content: question,
                        is_offer: false,
                    })
                })
            }
        })
    })

    describe('賣家管理情境', () => {
        it('賣家同時處理多個詢問的工作流程', async () => {
            const authService = await import('../../api/services/auth.service')
            const messageService = await import('../../api/services/message.service')

            vi.spyOn(authService, 'login').mockResolvedValue({
                user: mockUsers.seller,
                token: 'seller-token',
            })

            // Mock 多個對話
            const mockConversations = [
                {
                    with_user: mockUsers.newbie,
                    last_message: {
                        content: '這台車適合新手嗎？',
                        created_at: new Date().toISOString(),
                        is_read: false,
                        sender_id: mockUsers.newbie.id,
                    },
                    bicycle_id: mockBicycles.entry.id,
                    bicycle_title: mockBicycles.entry.title,
                },
                {
                    with_user: mockUsers.experienced,
                    last_message: {
                        content: '出價20000',
                        created_at: new Date().toISOString(),
                        is_read: false,
                        sender_id: mockUsers.experienced.id,
                    },
                    bicycle_id: mockBicycles.vintage.id,
                    bicycle_title: mockBicycles.vintage.title,
                },
            ]

            vi.spyOn(messageService, 'getConversations').mockResolvedValue(mockConversations)

            render(<App />, { wrapper: TestWrapper })

            // 賣家登入
            const loginButton = await screen.findByText('登入')
            await user.click(loginButton)

            await user.type(screen.getByLabelText(/email/i), 'seller@test.com')
            await user.type(screen.getByLabelText(/password/i), 'password123')
            await user.click(screen.getByRole('button', { name: /登入/i }))

            // 查看訊息列表
            const messagesLink = await screen.findByText(/訊息|messages/i)
            await user.click(messagesLink)

            await waitFor(() => {
                expect(messageService.getConversations).toHaveBeenCalled()
            })

            // 賣家應該看到所有對話
            await waitFor(() => {
                expect(screen.getByText('新手買家')).toBeInTheDocument()
                expect(screen.getByText('資深車友')).toBeInTheDocument()
                expect(screen.getByText('這台車適合新手嗎？')).toBeInTheDocument()
                expect(screen.getByText('出價20000')).toBeInTheDocument()
            })

            // 賣家優先處理出價訊息
            const offerConversation = screen.getByText('資深車友')
            await user.click(offerConversation)

            // 驗證進入對話詳情
            await waitFor(() => {
                expect(screen.getByText('復古鋼管車')).toBeInTheDocument()
            })
        })
    })

    describe('行動裝置情境', () => {
        it('手機用戶的快速瀏覽和出價', async () => {
            // Mock 行動裝置環境
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375, // iPhone width
            })

            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 667, // iPhone height
            })

            const bicycleService = await import('../../api/services/bicycle.service')
            const messageService = await import('../../api/services/message.service')

            vi.spyOn(bicycleService, 'getAllBicycles').mockResolvedValue({
                data: [mockBicycles.entry],
                total: 1,
                page: 1,
                limit: 10,
            })

            render(<App />, { wrapper: TestWrapper })

            // 手機用戶通常會快速滑動瀏覽
            await waitFor(() => {
                expect(screen.getByText('入門款公路車')).toBeInTheDocument()
            })

            // 手機用戶喜歡直接點擊圖片
            const bicycleImage = screen.getByRole('img', { name: /入門款公路車/i })
            await user.click(bicycleImage)

            // 手機用戶可能會使用語音輸入（模擬較短的訊息）
            const quickOfferButton = await screen.findByText(/快速出價/i)
            await user.click(quickOfferButton)

            vi.spyOn(messageService, 'sendMessage').mockResolvedValue({
                id: '4',
                content: '7500可以嗎',
                is_offer: true,
                offer_amount: 7500,
                offer_status: 'pending',
                sender: mockUsers.newbie,
                recipient: mockUsers.seller,
                bicycle: mockBicycles.entry,
                created_at: new Date().toISOString(),
            })

            await user.type(screen.getByLabelText(/出價金額/i), '7500')
            await user.type(screen.getByLabelText(/訊息/i), '7500可以嗎') // 簡短訊息

            const submitButton = screen.getByRole('button', { name: /送出/i })
            await user.click(submitButton)

            await waitFor(() => {
                expect(messageService.sendMessage).toHaveBeenCalledWith({
                    recipient_id: '3',
                    bicycle_id: '1',
                    content: '7500可以嗎',
                    is_offer: true,
                    offer_amount: 7500,
                })
            })
        })
    })

    describe('網路不穩定情境', () => {
        it('處理網路斷線和重連', async () => {
            const messageService = await import('../../api/services/message.service')

            // 第一次請求失敗
            vi.spyOn(messageService, 'sendMessage')
                .mockRejectedValueOnce(new Error('Network Error'))
                .mockResolvedValueOnce({
                    id: '5',
                    content: '重試成功',
                    is_offer: true,
                    offer_amount: 8000,
                    offer_status: 'pending',
                    sender: mockUsers.newbie,
                    recipient: mockUsers.seller,
                    bicycle: mockBicycles.entry,
                    created_at: new Date().toISOString(),
                })

            render(<App />, { wrapper: TestWrapper })

            const makeOfferButton = await screen.findByText(/出價/i)
            await user.click(makeOfferButton)

            await user.type(screen.getByLabelText(/出價金額/i), '8000')
            await user.type(screen.getByLabelText(/訊息/i), '重試測試')

            const submitButton = screen.getByRole('button', { name: /送出出價/i })
            await user.click(submitButton)

            // 第一次應該失敗
            await waitFor(() => {
                expect(screen.getByText(/網路錯誤/i)).toBeInTheDocument()
            })

            // 用戶點擊重試
            const retryButton = screen.getByRole('button', { name: /重試/i })
            await user.click(retryButton)

            // 第二次應該成功
            await waitFor(() => {
                expect(screen.getByText(/出價已送出/i)).toBeInTheDocument()
            })
        })
    })
})
