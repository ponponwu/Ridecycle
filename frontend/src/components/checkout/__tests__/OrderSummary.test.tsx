import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import OrderSummary from '../OrderSummary'
import { IBicycle, BicycleCondition } from '@/types/bicycle.types'
import { IDeliveryOption } from '@/types/checkout.types'

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)

describe('OrderSummary', () => {
    const mockBicycle: IBicycle = {
        id: '1',
        title: '測試自行車',
        brandId: '1',
        transmissionId: '1',
        year: '2021',
        bicycleType: 'road',
        frameSize: '56',
        description: 'Test description',
        price: 10000,
        condition: BicycleCondition.EXCELLENT,
        location: 'Taipei',
        contactMethod: 'message',
        photosUrls: ['https://example.com/bike.jpg'],
        status: 'available',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        brand: { id: 1, name: 'Test Brand', created_at: '', updated_at: '' },
        seller: {
            id: 1,
            name: 'Test Seller',
            full_name: 'Test Seller',
            email: 'test@example.com',
        },
    }

    it('renders bicycle information correctly', () => {
        render(
            <TestWrapper>
                <OrderSummary bicycle={mockBicycle} />
            </TestWrapper>
        )

        expect(screen.getByText('測試自行車')).toBeInTheDocument()
        expect(screen.getByText('Test Brand')).toBeInTheDocument()
        expect(screen.getByText('NT$ 10,000')).toBeInTheDocument()
    })

    it('renders delivery option information', () => {
        const deliveryOption: IDeliveryOption = {
            type: 'delivery',
            cost: 100,
            estimatedDays: { min: 3, max: 5 },
        }

        render(
            <TestWrapper>
                <OrderSummary bicycle={mockBicycle} deliveryOption={deliveryOption} />
            </TestWrapper>
        )

        expect(screen.getByText('宅配到府')).toBeInTheDocument()
        expect(screen.getByText('NT$ 100')).toBeInTheDocument()
    })

    it('renders pickup option information', () => {
        const pickupOption: IDeliveryOption = {
            type: 'pickup',
            cost: 0,
        }

        render(
            <TestWrapper>
                <OrderSummary bicycle={mockBicycle} deliveryOption={pickupOption} />
            </TestWrapper>
        )

        expect(screen.getByText('自行面交')).toBeInTheDocument()
        expect(screen.getByText('免運費')).toBeInTheDocument()
    })

    it('calculates total price correctly', () => {
        const deliveryOption: IDeliveryOption = {
            type: 'delivery',
            cost: 150,
        }

        render(
            <TestWrapper>
                <OrderSummary bicycle={mockBicycle} deliveryOption={deliveryOption} />
            </TestWrapper>
        )

        // 小計：10000
        expect(screen.getByText('NT$ 10,000')).toBeInTheDocument()
        // 運費：150
        expect(screen.getByText('NT$ 150')).toBeInTheDocument()
        // 稅金：500 (5%)
        expect(screen.getByText('NT$ 500')).toBeInTheDocument()
        // 總計：10650
        expect(screen.getByText('NT$ 10,650')).toBeInTheDocument()
    })

    it('shows seller information when available', () => {
        render(
            <TestWrapper>
                <OrderSummary bicycle={mockBicycle} />
            </TestWrapper>
        )

        expect(screen.getByText('Test Seller')).toBeInTheDocument()
        expect(screen.getByText('Taipei')).toBeInTheDocument()
    })
})
