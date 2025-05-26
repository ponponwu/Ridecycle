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
        const fetchRecentlyAddedBicycles = async () => {
            try {
                setIsLoading(true)
                const bicycles = await bicycleService.getRecentlyAddedBicycles(4)

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

                setRecentBicycles(bicycleCards)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch recently added bicycles:', err)
                setError('Failed to load recently added bicycles')
                setRecentBicycles([]) // 設定為空陣列以避免顯示錯誤
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecentlyAddedBicycles()
    }, [])

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
