/**
 * 前端使用者流程整合測試
 * 測試用戶從登入到購買的完整流程
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import App from '../../App'
import * as apiService from '../../api/services/bicycle.service'
import * as messageService from '../../api/services/message.service'
import * as authService from '../../api/services/auth.service'

// Mock API responses
const mockBicycles = [
    {
        id: '1',
        title: '優質二手腳踏車',
        description: '狀況良好的腳踏車',
        price: 15000,
        condition: 'good',
        size: 'M',
        photos: [{ url: 'http://example.com/bike1.jpg' }],
        seller: {
            id: '2',
            name: '賣家',
            email: 'seller@example.com',
        },
        brand: {
            id: '1',
            name: 'Giant',
        },
    },
]

const mockUser = {
    id: '1',
    name: '買家',
    email: 'buyer@example.com',
}

const mockSeller = {
    id: '2',
    name: '賣家',
    email: 'seller@example.com',
}

// Test wrapper component
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

describe('使用者流程整合測試', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
        user = userEvent.setup()

        // Reset all mocks
        vi.clearAllMocks()

        // Mock console.error to avoid noise in tests
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    describe('完整購買流程', () => {
        it('從登入到出價的完整流程', async () => {
            // Mock API calls
            vi.spyOn(authService, 'login').mockResolvedValue({
                user: mockUser,
                token: 'fake-token',
            })

            vi.spyOn(apiService, 'getAllBicycles').mockResolvedValue({
                data: mockBicycles,
                total: 1,
                page: 1,
                limit: 10,
            })

            vi.spyOn(apiService, 'getBicycleById').mockResolvedValue(mockBicycles[0])

            vi.spyOn(messageService, 'sendMessage').mockResolvedValue({
                id: '1',
                content: '我想要這台腳踏車',
                is_offer: true,
                offer_amount: 12000,
                offer_status: 'pending',
                sender: mockUser,
                recipient: mockSeller,
                bicycle: mockBicycles[0],
                created_at: new Date().toISOString(),
            })

            render(<App />, { wrapper: TestWrapper })

            // Step 1: 用戶登入
            const loginButton = await screen.findByText('登入')
            await user.click(loginButton)

            // 填寫登入表單
            const emailInput = screen.getByLabelText(/email|電子郵件/i)
            const passwordInput = screen.getByLabelText(/password|密碼/i)

            await user.type(emailInput, 'buyer@example.com')
            await user.type(passwordInput, 'password123')

            const submitButton = screen.getByRole('button', { name: /登入|sign in/i })
            await user.click(submitButton)

            // 等待登入完成
            await waitFor(() => {
                expect(authService.login).toHaveBeenCalledWith({
                    email: 'buyer@example.com',
                    password: 'password123',
                })
            })

            // Step 2: 瀏覽腳踏車列表
            await waitFor(() => {
                expect(screen.getByText('優質二手腳踏車')).toBeInTheDocument()
            })

            // Step 3: 點擊查看腳踏車詳情
            const bicycleCard = screen.getByText('優質二手腳踏車')
            await user.click(bicycleCard)

            // 等待詳情頁載入
            await waitFor(() => {
                expect(apiService.getBicycleById).toHaveBeenCalledWith('1')
            })

            // Step 4: 點擊出價按鈕
            const makeOfferButton = await screen.findByText(/出價|make offer/i)
            await user.click(makeOfferButton)

            // Step 5: 填寫出價表單
            const offerAmountInput = screen.getByLabelText(/出價金額|offer amount/i)
            const offerMessageInput = screen.getByLabelText(/訊息|message/i)

            await user.type(offerAmountInput, '12000')
            await user.type(offerMessageInput, '我想要這台腳踏車')

            // Step 6: 送出出價
            const sendOfferButton = screen.getByRole('button', { name: /送出出價|send offer/i })
            await user.click(sendOfferButton)

            // 驗證 API 被正確呼叫
            await waitFor(() => {
                expect(messageService.sendMessage).toHaveBeenCalledWith({
                    recipient_id: '2',
                    bicycle_id: '1',
                    content: '我想要這台腳踏車',
                    is_offer: true,
                    offer_amount: 12000,
                })
            })

            // Step 7: 驗證成功訊息
            await waitFor(() => {
                expect(screen.getByText(/出價已送出|offer sent/i)).toBeInTheDocument()
            })
        })
    })

    describe('防止自己對自己出價', () => {
        it('自己的商品不能出價', async () => {
            // Mock 用戶登入後看到自己的商品
            const ownBicycle = {
                ...mockBicycles[0],
                seller: mockUser, // 賣家是自己
            }

            vi.spyOn(authService, 'login').mockResolvedValue({
                user: mockUser,
                token: 'fake-token',
            })

            vi.spyOn(apiService, 'getBicycleById').mockResolvedValue(ownBicycle)

            render(<App />, { wrapper: TestWrapper })

            // 模擬已登入狀態
            const loginButton = await screen.findByText('登入')
            await user.click(loginButton)

            // 填寫並送出登入表單
            const emailInput = screen.getByLabelText(/email|電子郵件/i)
            const passwordInput = screen.getByLabelText(/password|密碼/i)

            await user.type(emailInput, 'buyer@example.com')
            await user.type(passwordInput, 'password123')

            const submitButton = screen.getByRole('button', { name: /登入|sign in/i })
            await user.click(submitButton)

            // 等待登入完成，然後導航到商品頁面
            await waitFor(() => {
                expect(authService.login).toHaveBeenCalled()
            })

            // 模擬導航到自己的商品
            // 在實際應用中，這會通過路由進行
            await waitFor(() => {
                expect(apiService.getBicycleById).toHaveBeenCalledWith('1')
            })

            // 驗證出價按鈕被禁用或顯示不同文字
            await waitFor(() => {
                const disabledButton = screen.queryByText('這是您的腳踏車')
                const offerButton = screen.queryByText(/出價|make offer/i)

                // 應該顯示"這是您的腳踏車"而不是"出價"
                expect(disabledButton).toBeInTheDocument()
                expect(offerButton).not.toBeInTheDocument()
            })
        })
    })

    describe('錯誤處理測試', () => {
        it('處理網路錯誤', async () => {
            // Mock API 錯誤
            vi.spyOn(authService, 'login').mockRejectedValue(new Error('網路錯誤'))

            render(<App />, { wrapper: TestWrapper })

            const loginButton = await screen.findByText('登入')
            await user.click(loginButton)

            const emailInput = screen.getByLabelText(/email|電子郵件/i)
            const passwordInput = screen.getByLabelText(/password|密碼/i)

            await user.type(emailInput, 'buyer@example.com')
            await user.type(passwordInput, 'wrongpassword')

            const submitButton = screen.getByRole('button', { name: /登入|sign in/i })
            await user.click(submitButton)

            // 驗證錯誤訊息顯示
            await waitFor(() => {
                expect(screen.getByText(/錯誤|error/i)).toBeInTheDocument()
            })
        })

        it('處理出價失敗', async () => {
            vi.spyOn(authService, 'login').mockResolvedValue({
                user: mockUser,
                token: 'fake-token',
            })

            vi.spyOn(apiService, 'getBicycleById').mockResolvedValue(mockBicycles[0])

            // Mock 出價失敗
            vi.spyOn(messageService, 'sendMessage').mockRejectedValue(new Error('不能對自己發布的腳踏車留言'))

            render(<App />, { wrapper: TestWrapper })

            // 完成登入流程
            const loginButton = await screen.findByText('登入')
            await user.click(loginButton)

            const emailInput = screen.getByLabelText(/email|電子郵件/i)
            const passwordInput = screen.getByLabelText(/password|密碼/i)

            await user.type(emailInput, 'buyer@example.com')
            await user.type(passwordInput, 'password123')

            const submitButton = screen.getByRole('button', { name: /登入|sign in/i })
            await user.click(submitButton)

            await waitFor(() => {
                expect(authService.login).toHaveBeenCalled()
            })

            // 嘗試出價
            const makeOfferButton = await screen.findByText(/出價|make offer/i)
            await user.click(makeOfferButton)

            const offerAmountInput = screen.getByLabelText(/出價金額|offer amount/i)
            await user.type(offerAmountInput, '12000')

            const sendOfferButton = screen.getByRole('button', { name: /送出出價|send offer/i })
            await user.click(sendOfferButton)

            // 驗證錯誤訊息顯示
            await waitFor(() => {
                expect(screen.getByText(/不能對自己發布的腳踏車留言/)).toBeInTheDocument()
            })
        })
    })

    describe('表單驗證測試', () => {
        it('出價金額驗證', async () => {
            vi.spyOn(authService, 'login').mockResolvedValue({
                user: mockUser,
                token: 'fake-token',
            })

            vi.spyOn(apiService, 'getBicycleById').mockResolvedValue(mockBicycles[0])

            render(<App />, { wrapper: TestWrapper })

            // 完成登入
            const loginButton = await screen.findByText('登入')
            await user.click(loginButton)

            const emailInput = screen.getByLabelText(/email|電子郵件/i)
            const passwordInput = screen.getByLabelText(/password|密碼/i)

            await user.type(emailInput, 'buyer@example.com')
            await user.type(passwordInput, 'password123')

            const submitButton = screen.getByRole('button', { name: /登入|sign in/i })
            await user.click(submitButton)

            // 打開出價對話框
            const makeOfferButton = await screen.findByText(/出價|make offer/i)
            await user.click(makeOfferButton)

            // 嘗試送出無效的出價金額
            const offerAmountInput = screen.getByLabelText(/出價金額|offer amount/i)
            await user.type(offerAmountInput, '-100') // 負數

            const sendOfferButton = screen.getByRole('button', { name: /送出出價|send offer/i })
            await user.click(sendOfferButton)

            // 驗證表單驗證錯誤
            await waitFor(() => {
                expect(screen.getByText(/出價金額必須大於 0/)).toBeInTheDocument()
            })
        })
    })
})
