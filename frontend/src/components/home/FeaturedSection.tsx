import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import BicycleGrid from '../bicycles/BicycleGrid'
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
                const bicycles = await bicycleService.getFeaturedBicycles(4)

                // 將 IBicycle 轉換為 BicycleCardProps 格式
                const bicycleCards: BicycleCardProps[] = bicycles.map((bicycle: IBicycle) => ({
                    id: bicycle.id.toString(),
                    title: bicycle.title,
                    price: bicycle.price,
                    location: bicycle.location,
                    condition: bicycle.condition,
                    brand: bicycle.brand?.name || 'Unknown Brand',
                    imageUrl: bicycle.photosUrls?.[0] || '/placeholder-bike.jpg', // 使用第一張圖片或預設圖片
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
    }, [])

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
            <BicycleGrid
                bicycles={featuredBicycles}
                title={t('featuredBicycles')}
                viewAllLink="/search?featured=true"
            />
        </div>
    )
}

export default FeaturedSection
