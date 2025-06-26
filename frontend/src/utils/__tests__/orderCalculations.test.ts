import { describe, it, expect } from 'vitest'
import {
    calculateOrderPrices,
    calculateShippingCost,
    calculateDeliveryTime,
    generateOrderId,
    validateOrderData,
} from '../orderCalculations'
import { IBicycle, BicycleCondition } from '@/types/bicycle.types'

describe('orderCalculations', () => {
    describe('calculateOrderPrices', () => {
        const mockBicycle: IBicycle = {
            id: '1',
            title: 'Test Bike',
            brandId: '1',
            transmissionId: '1',
            year: '2021',
            bicycleType: 'road',
            frameSize: '54',
            description: 'Test description',
            price: 10000,
            condition: BicycleCondition.EXCELLENT,
            location: 'Taipei',
            contactMethod: 'message',
            photosUrls: [],
            status: 'available',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            brand: { id: 1, name: 'Test Brand', created_at: '', updated_at: '' },
            seller: {
                id: 1,
                name: 'Test Seller',
                full_name: 'Test Seller',
                email: 'test@example.com',
            },
        }

        it('calculates order prices correctly with default values', () => {
            const result = calculateOrderPrices(mockBicycle)

            expect(result).toEqual({
                subtotal: 10000,
                shipping: 100, // 默認運費
                tax: 500, // 5% 稅金
                total: 10600,
            })
        })

        it('calculates order prices with custom shipping cost', () => {
            const result = calculateOrderPrices(mockBicycle, 150)

            expect(result).toEqual({
                subtotal: 10000,
                shipping: 150,
                tax: 500,
                total: 10650,
            })
        })

        it('calculates order prices with custom tax rate', () => {
            const result = calculateOrderPrices(mockBicycle, 100, 0.1) // 10% 稅率

            expect(result).toEqual({
                subtotal: 10000,
                shipping: 100,
                tax: 1000, // 10% 稅金，已四捨五入
                total: 11100,
            })
        })

        it('rounds tax to nearest integer', () => {
            const bicycleWithOddPrice: IBicycle = {
                ...mockBicycle,
                price: 9999, // 會產生 499.95 的稅金
            }

            const result = calculateOrderPrices(bicycleWithOddPrice)

            expect(result.tax).toBe(500) // 應該四捨五入到 500
            expect(result.total).toBe(10599)
        })
    })

    describe('calculateShippingCost', () => {
        it('returns base shipping cost for regular regions', () => {
            expect(calculateShippingCost('taipei')).toBe(100)
            expect(calculateShippingCost('taichung')).toBe(100)
            expect(calculateShippingCost('kaohsiung')).toBe(100)
        })

        it('adds extra cost for remote regions', () => {
            expect(calculateShippingCost('penghu')).toBe(150) // 基本 100 + 偏遠 50
            expect(calculateShippingCost('kinmen')).toBe(150)
            expect(calculateShippingCost('lienchiang')).toBe(150)
            expect(calculateShippingCost('taitung')).toBe(150)
            expect(calculateShippingCost('hualien')).toBe(150)
        })

        it('adds extra cost for heavy items', () => {
            expect(calculateShippingCost('taipei', 12)).toBe(140) // 基本 100 + 超重 40 (2kg * 20)
            expect(calculateShippingCost('taipei', 15)).toBe(200) // 基本 100 + 超重 100 (5kg * 20)
        })

        it('combines remote region and heavy item costs', () => {
            expect(calculateShippingCost('penghu', 12)).toBe(190) // 基本 100 + 偏遠 50 + 超重 40
        })

        it('handles edge cases', () => {
            expect(calculateShippingCost('taipei', 10)).toBe(100) // 剛好 10kg 不加價
            expect(calculateShippingCost('taipei', 10.1)).toBe(120) // 超過 10kg 加價
        })
    })

    describe('calculateDeliveryTime', () => {
        it('returns correct delivery time for remote regions', () => {
            expect(calculateDeliveryTime('penghu')).toEqual({ min: 5, max: 7 })
            expect(calculateDeliveryTime('kinmen')).toEqual({ min: 5, max: 7 })
            expect(calculateDeliveryTime('lienchiang')).toEqual({ min: 5, max: 7 })
        })

        it('returns correct delivery time for mountain regions', () => {
            expect(calculateDeliveryTime('nantou')).toEqual({ min: 4, max: 6 })
            expect(calculateDeliveryTime('hualien')).toEqual({ min: 4, max: 6 })
            expect(calculateDeliveryTime('taitung')).toEqual({ min: 4, max: 6 })
        })

        it('returns correct delivery time for regular regions', () => {
            expect(calculateDeliveryTime('taipei')).toEqual({ min: 3, max: 5 })
            expect(calculateDeliveryTime('taichung')).toEqual({ min: 3, max: 5 })
            expect(calculateDeliveryTime('kaohsiung')).toEqual({ min: 3, max: 5 })
        })
    })

    describe('generateOrderId', () => {
        it('generates order ID with default prefix', () => {
            const orderId = generateOrderId()
            expect(orderId).toMatch(/^ORD-\d{8}-\d{3}$/)
        })

        it('generates order ID with custom prefix', () => {
            const orderId = generateOrderId('TEST')
            expect(orderId).toMatch(/^TEST-\d{8}-\d{3}$/)
        })

        it('generates unique order IDs', () => {
            const ids = Array.from({ length: 100 }, () => generateOrderId())
            const uniqueIds = new Set(ids)
            expect(uniqueIds.size).toBe(100) // 所有 ID 都應該是唯一的
        })

        it('includes timestamp in order ID', () => {
            const beforeTimestamp = Date.now()
            const orderId = generateOrderId()
            const afterTimestamp = Date.now()

            // 提取時間戳部分
            const timestampPart = orderId.split('-')[1]
            const extractedTimestamp = parseInt(timestampPart, 10)

            // 檢查時間戳是否在合理範圍內
            const beforeLast8Digits = parseInt(beforeTimestamp.toString().slice(-8), 10)
            const afterLast8Digits = parseInt(afterTimestamp.toString().slice(-8), 10)

            expect(extractedTimestamp).toBeGreaterThanOrEqual(beforeLast8Digits)
            expect(extractedTimestamp).toBeLessThanOrEqual(afterLast8Digits)
        })
    })

    describe('validateOrderData', () => {
        const validBicycle = {
            id: '1',
            title: 'Test Bike',
            price: 10000,
        }

        const validShippingInfo = {
            fullName: '王小明',
            phoneNumber: '0912345678',
            county: 'taipei',
            district: 'zhongshan',
            addressLine1: '中山路123號',
            postalCode: '104',
        }

        const validPaymentInfo = {
            transferNote: '王小明',
            accountLastFiveDigits: '12345',
        }

        it('returns true for valid order data', () => {
            const result = validateOrderData(validBicycle, validShippingInfo, validPaymentInfo)
            expect(result).toBe(true)
        })

        it('returns false when bicycle data is invalid', () => {
            const invalidBicycle = { title: 'Test Bike' } // 缺少 id 和 price
            const result = validateOrderData(invalidBicycle, validShippingInfo, validPaymentInfo)
            expect(result).toBe(false)
        })

        it('returns false when shipping info is invalid', () => {
            const invalidShippingInfo = { fullName: '王小明' } // 缺少其他必填欄位
            const result = validateOrderData(validBicycle, invalidShippingInfo, validPaymentInfo)
            expect(result).toBe(false)
        })

        it('returns false when payment info is invalid', () => {
            const invalidPaymentInfo = { transferNote: '王小明' } // 缺少其他必填欄位
            const result = validateOrderData(validBicycle, validShippingInfo, invalidPaymentInfo)
            expect(result).toBe(false)
        })

        it('handles missing fields correctly', () => {
            const bicycleWithMissingField = {
                id: '1',
                title: 'Test Bike',
                // price 欄位缺失
            }

            const result = validateOrderData(bicycleWithMissingField, validShippingInfo, validPaymentInfo)
            expect(result).toBe(false)
        })

        it('handles null and undefined values', () => {
            expect(validateOrderData(null, validShippingInfo, validPaymentInfo)).toBe(false)
            expect(validateOrderData(validBicycle, null, validPaymentInfo)).toBe(false)
            expect(validateOrderData(validBicycle, validShippingInfo, null)).toBe(false)
        })
    })
})
