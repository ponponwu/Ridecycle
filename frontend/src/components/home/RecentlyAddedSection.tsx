import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import BicycleGrid from '../bicycles/BicycleGrid'
import { BicycleCardProps } from '../bicycles/BicycleCard'
import { bicycleService } from '@/api'
import { IBicycle } from '@/types/bicycle.types'

const RecentlyAddedSection = () => {
    const { t } = useTranslation()
    const [recentBicycles, setRecentBicycles] = useState<BicycleCardProps[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecentBicycles = async () => {
            try {
                setIsLoading(true)
                const bicycles = await bicycleService.getRecentlyAddedBicycles(6) // 改為 6 個以配合 3 列顯示

                // 將 IBicycle 轉換為 BicycleCardProps 格式，加入空值檢查
                const bicycleCards: BicycleCardProps[] = bicycles
                    .filter((bicycle) => bicycle && bicycle.id) // 過濾掉無效的資料
                    .map((bicycle: IBicycle) => ({
                        id: bicycle.id ? bicycle.id.toString() : '',
                        title: bicycle.title || 'Unknown Title',
                        price: typeof bicycle.price === 'number' ? bicycle.price : 0,
                        originalPrice:
                            bicycle.original_price || bicycle.bicycle_model?.original_msrp || bicycle.originalPrice,
                        location: bicycle.location || 'Unknown Location',
                        condition: bicycle.condition || 'unknown',
                        brand: bicycle.brand_name || bicycle.brand?.name || t('unknownBrand'),
                        model: bicycle.model_name || bicycle.bicycle_model?.name || bicycle.title || 'Unknown Model',
                        year: bicycle.year || undefined,
                        frameSize: bicycle.frameSize || undefined,
                        transmission: bicycle.transmission_name || bicycle.transmission?.name || undefined,
                        imageUrl: bicycle.photos_urls?.[0] || bicycle.photosUrls?.[0] || '/placeholder-bike.jpg',
                        isFavorite: bicycle.isFavorite || false,
                    }))

                setRecentBicycles(bicycleCards)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch recent bicycles:', err)
                setError('Failed to load recent bicycles')
                setRecentBicycles([]) // 設定為空陣列以避免顯示錯誤
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecentBicycles()
    }, [t])

    if (isLoading) {
        return (
            <div className="container px-4 mx-auto py-8 bg-gray-50 rounded-xl">
                <div className="text-center text-gray-500">{t('loading')}</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container px-4 mx-auto py-8 bg-gray-50 rounded-xl">
                <div className="text-center text-red-500">{error}</div>
            </div>
        )
    }

    return (
        <div className="container px-4 mx-auto py-8 bg-gray-50 rounded-xl">
            <BicycleGrid bicycles={recentBicycles} title={t('recentlyAdded')} viewAllLink="/search?sort=newest" />
        </div>
    )
}

export default RecentlyAddedSection
