import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import BicycleScrollGallery from '../bicycles/BicycleScrollGallery'
import { BicycleCardProps } from '../bicycles/BicycleCard'
import { bicycleService } from '@/api'
import { IBicycle } from '@/types/bicycle.types'

const FeaturedSection = () => {
    const { t } = useTranslation()
    const [featuredBicycles, setFeaturedBicycles] = useState<BicycleCardProps[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchFeaturedBicycles = async () => {
            try {
                setIsLoading(true)
                const bicycles = await bicycleService.getFeaturedBicycles(10) // 改為 10 個以配合水平滾動顯示

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

                setFeaturedBicycles(bicycleCards)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch featured bicycles:', err)
                setError('Failed to load featured bicycles')
                setFeaturedBicycles([]) // 設定為空陣列以避免顯示錯誤
            } finally {
                setIsLoading(false)
            }
        }

        fetchFeaturedBicycles()
    }, [t])

    if (isLoading) {
        return (
            <div className="container px-4 mx-auto py-8">
                <div className="text-center text-gray-500">{t('loading')}</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container px-4 mx-auto py-8">
                <div className="text-center text-red-500">{error}</div>
            </div>
        )
    }

    return (
        <div className="container px-4 mx-auto py-8">
            <BicycleScrollGallery
                bicycles={featuredBicycles}
                title={t('featuredBicycles')}
                subtitle="精選高品質二手自行車"
                viewAllLink="/search?featured=true"
                showScrollHint={true}
                enableDrag={true}
            />
        </div>
    )
}

export default FeaturedSection
