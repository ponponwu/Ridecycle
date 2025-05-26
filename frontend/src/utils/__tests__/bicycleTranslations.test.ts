import { describe, it, expect, vi } from 'vitest'
import { translateBicycleCondition, translateBicycleType } from '../bicycleTranslations'
import { TFunction } from 'i18next'

// Mock translation function
const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
        'conditionOptions.brandNew': '全新',
        'conditionOptions.likeNew': '近全新',
        'conditionOptions.excellent': '極佳',
        'conditionOptions.good': '良好',
        'conditionOptions.fair': '尚可',
        'conditionOptions.poor': '需要維修',
        roadbike: '公路車',
        mountainbike: '登山車',
        hybridbike: '混合車',
        electricbike: '電動車',
        bmx: 'BMX',
        foldingbike: '摺疊車',
        cruiserbike: '巡航車',
        gravelbike: '礫石車',
    }
    return translations[key] || key
}) as unknown as TFunction

describe('bicycleTranslations', () => {
    describe('translateBicycleCondition', () => {
        it('translates brand_new correctly', () => {
            expect(translateBicycleCondition('brand_new', mockT)).toBe('全新')
        })

        it('translates like_new correctly', () => {
            expect(translateBicycleCondition('like_new', mockT)).toBe('近全新')
        })

        it('translates excellent correctly', () => {
            expect(translateBicycleCondition('excellent', mockT)).toBe('極佳')
        })

        it('translates good correctly', () => {
            expect(translateBicycleCondition('good', mockT)).toBe('良好')
        })

        it('translates fair correctly', () => {
            expect(translateBicycleCondition('fair', mockT)).toBe('尚可')
        })

        it('translates poor correctly', () => {
            expect(translateBicycleCondition('poor', mockT)).toBe('需要維修')
        })

        it('returns original value for unknown condition', () => {
            expect(translateBicycleCondition('unknown_condition', mockT)).toBe('unknown_condition')
        })

        it('handles empty string', () => {
            expect(translateBicycleCondition('', mockT)).toBe('')
        })
    })

    describe('translateBicycleType', () => {
        it('translates road correctly', () => {
            expect(translateBicycleType('road', mockT)).toBe('公路車')
        })

        it('translates mountain correctly', () => {
            expect(translateBicycleType('mountain', mockT)).toBe('登山車')
        })

        it('translates hybrid correctly', () => {
            expect(translateBicycleType('hybrid', mockT)).toBe('混合車')
        })

        it('translates electric correctly', () => {
            expect(translateBicycleType('electric', mockT)).toBe('電動車')
        })

        it('translates bmx correctly', () => {
            expect(translateBicycleType('bmx', mockT)).toBe('BMX')
        })

        it('translates folding correctly', () => {
            expect(translateBicycleType('folding', mockT)).toBe('摺疊車')
        })

        it('translates cruiser correctly', () => {
            expect(translateBicycleType('cruiser', mockT)).toBe('巡航車')
        })

        it('translates gravel correctly', () => {
            expect(translateBicycleType('gravel', mockT)).toBe('礫石車')
        })

        it('returns original value for unknown type', () => {
            expect(translateBicycleType('unknown_type', mockT)).toBe('unknown_type')
        })

        it('handles empty string', () => {
            expect(translateBicycleType('', mockT)).toBe('')
        })
    })
})
