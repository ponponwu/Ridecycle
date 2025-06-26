import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import DeliveryOptionsForm from '../DeliveryOptionsForm'
import { IDeliveryOption } from '@/types/checkout.types'

// Mock the utility functions
vi.mock('@/utils/orderCalculations', () => ({
    calculateShippingCost: vi.fn((county: string, weight?: number) => {
        if (county === 'penghu') return 150 // 偏遠地區
        if (weight && weight > 10) return 120 // 重物加價
        return 100 // 基本運費
    }),
    calculateDeliveryTime: vi.fn((county: string) => {
        if (county === 'penghu') return { min: 5, max: 7 } // 離島
        return { min: 3, max: 5 } // 一般地區
    }),
}))

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)

describe('DeliveryOptionsForm', () => {
    const mockOnOptionChange = vi.fn()

    const defaultProps = {
        selectedOption: {
            type: 'delivery' as const,
            cost: 100,
            estimatedDays: { min: 3, max: 5 },
        },
        onOptionChange: mockOnOptionChange,
        county: 'taipei',
        bicycleWeight: 8,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders delivery options correctly', () => {
        render(
            <TestWrapper>
                <DeliveryOptionsForm {...defaultProps} />
            </TestWrapper>
        )

        // 檢查標題
        expect(screen.getByText('配送方式')).toBeInTheDocument()

        // 檢查宅配選項
        expect(screen.getByText('宅配到府')).toBeInTheDocument()
        expect(screen.getByText('NT$ 100')).toBeInTheDocument() // 運費

        // 檢查面交選項
        expect(screen.getByText('自行面交')).toBeInTheDocument()
        expect(screen.getByText('免運費')).toBeInTheDocument()
    })

    it('shows correct shipping cost for different counties', () => {
        render(
            <TestWrapper>
                <DeliveryOptionsForm {...defaultProps} county="penghu" />
            </TestWrapper>
        )

        // 澎湖應該顯示較高的運費
        expect(screen.getByText('NT$ 150')).toBeInTheDocument()
    })

    it('shows pickup payment flow when pickup is selected', () => {
        const pickupOption: IDeliveryOption = {
            type: 'pickup',
            cost: 0,
            note: '面交說明',
        }

        render(
            <TestWrapper>
                <DeliveryOptionsForm {...defaultProps} selectedOption={pickupOption} />
            </TestWrapper>
        )

        // 檢查面交付款流程說明
        expect(screen.getByText('面交付款流程')).toBeInTheDocument()
        expect(screen.getByText('1. 完成線上付款（款項暫由平台保管）')).toBeInTheDocument()
        expect(screen.getByText('退貨政策：面交後七天內可申請退貨，超過期限不接受退貨')).toBeInTheDocument()
        expect(screen.getByText('⚠️ 請務必透過平台進行交易，平台外交易無法提供保障')).toBeInTheDocument()
    })

    it('calls onOptionChange when delivery option is selected', () => {
        render(
            <TestWrapper>
                <DeliveryOptionsForm {...defaultProps} />
            </TestWrapper>
        )

        // 點擊宅配選項
        const deliveryRadio = screen.getByRole('radio', { name: /宅配到府/ })
        fireEvent.click(deliveryRadio)

        expect(mockOnOptionChange).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'delivery',
                cost: 100,
                estimatedDays: { min: 3, max: 5 },
            })
        )
    })

    it('calls onOptionChange when pickup option is selected', () => {
        render(
            <TestWrapper>
                <DeliveryOptionsForm {...defaultProps} />
            </TestWrapper>
        )

        // 點擊面交選項
        const pickupRadio = screen.getByRole('radio', { name: /自行面交/ })
        fireEvent.click(pickupRadio)

        expect(mockOnOptionChange).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'pickup',
                cost: 0,
            })
        )
    })

    it('shows correct styling for selected option', () => {
        const pickupOption: IDeliveryOption = {
            type: 'pickup',
            cost: 0,
        }

        render(
            <TestWrapper>
                <DeliveryOptionsForm {...defaultProps} selectedOption={pickupOption} />
            </TestWrapper>
        )

        // 檢查選中狀態的樣式
        const pickupCard = screen.getByRole('radio', { name: /自行面交/ }).closest('.cursor-pointer')
        expect(pickupCard).toHaveClass('ring-2', 'ring-green-600', 'bg-green-50')
    })

    it('handles heavy bicycle shipping cost correctly', () => {
        render(
            <TestWrapper>
                <DeliveryOptionsForm {...defaultProps} bicycleWeight={15} />
            </TestWrapper>
        )

        // 重物應該顯示較高的運費
        expect(screen.getByText('NT$ 120')).toBeInTheDocument()
    })

    it('shows delivery time for different regions', () => {
        render(
            <TestWrapper>
                <DeliveryOptionsForm {...defaultProps} county="penghu" />
            </TestWrapper>
        )

        // 檢查離島的配送時間
        expect(screen.getByText('5-7 個工作日')).toBeInTheDocument()
    })

    it('handles missing county gracefully', () => {
        render(
            <TestWrapper>
                <DeliveryOptionsForm {...defaultProps} county="" />
            </TestWrapper>
        )

        // 應該顯示默認運費
        expect(screen.getByText('NT$ 100')).toBeInTheDocument()
        expect(screen.getByText('3-5 個工作日')).toBeInTheDocument()
    })
})
