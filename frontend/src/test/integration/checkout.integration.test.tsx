import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import Checkout from '@/pages/Checkout'
import { IBicycle, BicycleCondition } from '@/types/bicycle.types'

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({
            state: { bicycle: mockBicycle },
        }),
    }
})

// Mock utility functions
vi.mock('@/utils/orderCalculations', () => ({
    calculateShippingCost: vi.fn((county: string, weight?: number) => {
        if (county === 'penghu') return 150
        if (weight && weight > 10) return 120
        return 100
    }),
    calculateDeliveryTime: vi.fn(() => ({ min: 3, max: 5 })),
    generateOrderId: vi.fn(() => 'ORD-12345678-123'),
    validateOrderData: vi.fn(() => true),
    calculateOrderPrices: vi.fn((bicycle, shipping = 100) => ({
        subtotal: bicycle.price,
        shipping,
        tax: Math.round(bicycle.price * 0.05),
        total: bicycle.price + shipping + Math.round(bicycle.price * 0.05),
    })),
}))

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
})

const mockBicycle: IBicycle = {
    id: '1',
    title: '2021 Trek Domane SL 6',
    brandId: '1',
    transmissionId: '1',
    year: '2021',
    bicycleType: 'road',
    frameSize: '56',
    description: 'Excellent condition road bike',
    price: 85000,
    condition: BicycleCondition.EXCELLENT,
    location: 'Taipei',
    contactMethod: 'message',
    photosUrls: ['https://example.com/bike1.jpg'],
    status: 'available',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    weight: 8.5,
    brand: { id: 1, name: 'Trek', created_at: '', updated_at: '' },
    seller: {
        id: 1,
        name: 'John Doe',
        full_name: 'John Doe',
        email: 'john@example.com',
    },
}

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </BrowserRouter>
)

describe('Checkout Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('completes full checkout flow with delivery option', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <Checkout />
            </TestWrapper>
        )

        // 檢查初始狀態
        expect(screen.getByText('結帳')).toBeInTheDocument()
        expect(screen.getByText('配送地址')).toBeInTheDocument()

        // Step 1: 填寫配送地址
        await user.type(screen.getByPlaceholderText('請輸入收件人姓名'), '王小明')
        await user.type(screen.getByPlaceholderText('請輸入手機號碼'), '0912345678')

        // 選擇縣市
        const countySelect = screen.getByRole('combobox', { name: /縣市/ })
        await user.click(countySelect)
        await user.click(screen.getByText('台北市'))

        // 選擇鄉鎮區
        const districtSelect = screen.getByRole('combobox', { name: /鄉鎮市區/ })
        await user.click(districtSelect)
        await user.click(screen.getByText('中山區'))

        await user.type(screen.getByPlaceholderText('請輸入詳細地址'), '中山北路二段123號')

        // 提交配送地址
        const continueButton = screen.getByRole('button', { name: /繼續/ })
        await user.click(continueButton)

        // Step 2: 選擇配送方式
        await waitFor(() => {
            expect(screen.getByText('配送方式')).toBeInTheDocument()
        })

        // 檢查宅配選項已被選中（默認）
        expect(screen.getByText('宅配到府')).toBeInTheDocument()
        expect(screen.getByText('NT$ 100')).toBeInTheDocument()

        // 繼續到付款頁面
        const continueToPaymentButton = screen.getByRole('button', { name: /繼續付款/ })
        await user.click(continueToPaymentButton)

        // Step 3: 填寫付款資訊
        await waitFor(() => {
            expect(screen.getByText('付款資訊')).toBeInTheDocument()
        })

        // 檢查銀行帳戶資訊
        expect(screen.getByText('玉山銀行')).toBeInTheDocument()
        expect(screen.getByText('1234567890123')).toBeInTheDocument()

        // 填寫轉帳資訊
        await user.type(screen.getByPlaceholderText('請輸入您的姓名作為轉帳備註'), '王小明')
        await user.type(screen.getByPlaceholderText('請輸入轉帳帳戶後五碼'), '56789')

        // 提交付款資訊
        const reviewOrderButton = screen.getByRole('button', { name: /檢查您的訂單/ })
        await user.click(reviewOrderButton)

        // Step 4: 訂單確認
        await waitFor(() => {
            expect(screen.getByText('訂單確認')).toBeInTheDocument()
        })

        // 檢查商品資訊
        expect(screen.getByText('2021 Trek Domane SL 6')).toBeInTheDocument()
        expect(screen.getByText('NT$ 85,000')).toBeInTheDocument()

        // 檢查配送方式
        expect(screen.getByText('宅配到府')).toBeInTheDocument()

        // 檢查配送地址
        expect(screen.getByText('王小明')).toBeInTheDocument()
        expect(screen.getByText('0912345678')).toBeInTheDocument()
        expect(screen.getByText('台北市 中山區')).toBeInTheDocument()

        // 檢查付款方式
        expect(screen.getByText('銀行轉帳')).toBeInTheDocument()
        expect(screen.getByText('轉帳備註：王小明')).toBeInTheDocument()
        expect(screen.getByText('轉帳帳戶：*****56789')).toBeInTheDocument()

        // 檢查價格摘要
        expect(screen.getByText('NT$ 85,000')).toBeInTheDocument() // 小計
        expect(screen.getByText('NT$ 100')).toBeInTheDocument() // 運費
        expect(screen.getByText('NT$ 4,250')).toBeInTheDocument() // 稅金 (5%)
        expect(screen.getByText('NT$ 89,350')).toBeInTheDocument() // 總計

        // 同意條款
        const agreeCheckbox = screen.getByRole('checkbox')
        await user.click(agreeCheckbox)

        // 下單
        const placeOrderButton = screen.getByRole('button', { name: /下單/ })
        await user.click(placeOrderButton)

        // 等待導航到成功頁面
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/order-success', {
                state: expect.objectContaining({
                    orderId: 'ORD-12345678-123',
                    bicycle: mockBicycle,
                }),
            })
        })
    })

    it('completes checkout flow with pickup option', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <Checkout />
            </TestWrapper>
        )

        // Step 1: 填寫配送地址（即使選擇面交也需要聯絡資訊）
        await user.type(screen.getByPlaceholderText('請輸入收件人姓名'), '張小華')
        await user.type(screen.getByPlaceholderText('請輸入手機號碼'), '0987654321')

        const countySelect = screen.getByRole('combobox', { name: /縣市/ })
        await user.click(countySelect)
        await user.click(screen.getByText('高雄市'))

        const districtSelect = screen.getByRole('combobox', { name: /鄉鎮市區/ })
        await user.click(districtSelect)
        await user.click(screen.getByText('前金區'))

        await user.type(screen.getByPlaceholderText('請輸入詳細地址'), '中正四路100號')

        const continueButton = screen.getByRole('button', { name: /繼續/ })
        await user.click(continueButton)

        // Step 2: 選擇面交
        await waitFor(() => {
            expect(screen.getByText('配送方式')).toBeInTheDocument()
        })

        const pickupRadio = screen.getByRole('radio', { name: /自行面交/ })
        await user.click(pickupRadio)

        // 檢查面交說明
        await waitFor(() => {
            expect(screen.getByText('面交付款流程')).toBeInTheDocument()
            expect(screen.getByText('1. 完成線上付款（款項暫由平台保管）')).toBeInTheDocument()
            expect(screen.getByText('⚠️ 請務必透過平台進行交易，平台外交易無法提供保障')).toBeInTheDocument()
        })

        const continueToPaymentButton = screen.getByRole('button', { name: /繼續付款/ })
        await user.click(continueToPaymentButton)

        // Step 3: 填寫付款資訊
        await waitFor(() => {
            expect(screen.getByText('付款資訊')).toBeInTheDocument()
        })

        await user.type(screen.getByPlaceholderText('請輸入您的姓名作為轉帳備註'), '張小華')
        await user.type(screen.getByPlaceholderText('請輸入轉帳帳戶後五碼'), '99999')

        const reviewOrderButton = screen.getByRole('button', { name: /檢查您的訂單/ })
        await user.click(reviewOrderButton)

        // Step 4: 確認面交訂單
        await waitFor(() => {
            expect(screen.getByText('訂單確認')).toBeInTheDocument()
        })

        // 檢查面交配送方式
        expect(screen.getByText('自行面交')).toBeInTheDocument()
        expect(screen.getByText('免運費')).toBeInTheDocument()

        // 檢查面交說明
        expect(screen.getByText('賣家會與您聯繫約定面交時間地點')).toBeInTheDocument()
        expect(screen.getByText('款項由平台保管，驗收完成後7天後撥款')).toBeInTheDocument()

        // 檢查沒有配送地址區塊（面交時不顯示）
        expect(screen.queryByText('配送地址')).not.toBeInTheDocument()

        // 檢查價格（免運費）
        expect(screen.getByText('NT$ 0')).toBeInTheDocument() // 運費為0

        // 同意條款並下單
        const agreeCheckbox = screen.getByRole('checkbox')
        await user.click(agreeCheckbox)

        const placeOrderButton = screen.getByRole('button', { name: /下單/ })
        await user.click(placeOrderButton)

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/order-success', {
                state: expect.objectContaining({
                    deliveryOption: expect.objectContaining({
                        type: 'pickup',
                        cost: 0,
                    }),
                }),
            })
        })
    })

    it('validates form fields and shows error messages', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <Checkout />
            </TestWrapper>
        )

        // 嘗試不填寫資料直接提交
        const continueButton = screen.getByRole('button', { name: /繼續/ })
        await user.click(continueButton)

        // 檢查驗證錯誤
        await waitFor(() => {
            expect(screen.getByText('此欄位為必填')).toBeInTheDocument()
        })
    })

    it('allows navigation back through steps', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <Checkout />
            </TestWrapper>
        )

        // 完成配送地址表單
        await user.type(screen.getByPlaceholderText('請輸入收件人姓名'), '測試用戶')
        await user.type(screen.getByPlaceholderText('請輸入手機號碼'), '0912345678')

        const countySelect = screen.getByRole('combobox', { name: /縣市/ })
        await user.click(countySelect)
        await user.click(screen.getByText('台北市'))

        const districtSelect = screen.getByRole('combobox', { name: /鄉鎮市區/ })
        await user.click(districtSelect)
        await user.click(screen.getByText('信義區'))

        await user.type(screen.getByPlaceholderText('請輸入詳細地址'), '信義路五段7號')

        // 進入配送選擇步驟
        await user.click(screen.getByRole('button', { name: /繼續/ }))

        await waitFor(() => {
            expect(screen.getByText('配送方式')).toBeInTheDocument()
        })

        // 進入付款步驟
        await user.click(screen.getByRole('button', { name: /繼續付款/ }))

        await waitFor(() => {
            expect(screen.getByText('付款資訊')).toBeInTheDocument()
        })

        // 返回配送選擇
        const backButton = screen.getByRole('button', { name: /返回配送/ })
        await user.click(backButton)

        await waitFor(() => {
            expect(screen.getByText('配送方式')).toBeInTheDocument()
        })

        // 再次返回配送地址
        const previousButton = screen.getByRole('button', { name: /上一步/ })
        await user.click(previousButton)

        await waitFor(() => {
            expect(screen.getByText('配送地址')).toBeInTheDocument()
            // 檢查表單資料是否保留
            expect(screen.getByDisplayValue('測試用戶')).toBeInTheDocument()
        })
    })

    it('shows correct pricing for different regions and weights', async () => {
        const user = userEvent.setup()

        // 重載頁面，模擬重自行車
        const heavyBicycle = { ...mockBicycle, weight: 15 }

        render(
            <TestWrapper>
                <Checkout />
            </TestWrapper>
        )

        // 填寫配送地址到偏遠地區
        await user.type(screen.getByPlaceholderText('請輸入收件人姓名'), '測試用戶')
        await user.type(screen.getByPlaceholderText('請輸入手機號碼'), '0912345678')

        const countySelect = screen.getByRole('combobox', { name: /縣市/ })
        await user.click(countySelect)
        await user.click(screen.getByText('澎湖縣'))

        const districtSelect = screen.getByRole('combobox', { name: /鄉鎮市區/ })
        await user.click(districtSelect)
        await user.click(screen.getByText('馬公市'))

        await user.type(screen.getByPlaceholderText('請輸入詳細地址'), '中正路123號')

        // 進入配送選擇，檢查運費
        await user.click(screen.getByRole('button', { name: /繼續/ }))

        await waitFor(() => {
            // 應該顯示偏遠地區的較高運費
            expect(screen.getByText('NT$ 150')).toBeInTheDocument()
        })
    })
})
