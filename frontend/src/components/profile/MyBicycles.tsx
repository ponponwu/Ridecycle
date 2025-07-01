import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { bicycleService } from '@/api'
import { IBicycle } from '@/types/bicycle.types'
import BicycleGrid from '@/components/bicycles/BicycleGrid'
import { BicycleCardProps } from '@/components/bicycles/BicycleCard'
import { Bike } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MyBicycles = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [myBicycles, setMyBicycles] = useState<IBicycle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMyBicycles = async () => {
            try {
                setIsLoading(true)
                const response = await bicycleService.getMyBicycles() // Assuming this returns IBicycleListResponse
                setMyBicycles(response.bicycles || []) // Ensure it's an array
                setError(null)
            } catch (err) {
                console.error('Failed to fetch my bicycles:', err)
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError('An unknown error occurred.')
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchMyBicycles()
    }, [])

    const bicycleCardData: BicycleCardProps[] = myBicycles
        .filter((bike) => bike && bike.id) // 過濾掉無效的資料
        .map((bike) => ({
            id: bike.id ? bike.id.toString() : '',
            title: bike.title || 'Unknown Title',
            price: typeof bike.price === 'number' ? bike.price : 0,
            originalPrice: bike.original_price || bike.bicycle_model?.original_msrp || bike.originalPrice,
            location: bike.location || 'Unknown Location',
            condition: bike.condition || 'unknown',
            brand: bike.brand_name || bike.brand?.name || 'Unknown Brand',
            model: bike.model_name || bike.bicycle_model?.name || bike.title || 'Unknown Model',
            year: bike.year || undefined,
            frameSize: bike.frameSize || undefined,
            transmission: bike.transmission_name || bike.transmission?.name || undefined,
            imageUrl:
                bike.photos_urls && bike.photos_urls.length > 0
                    ? bike.photos_urls[0]
                    : bike.photosUrls && bike.photosUrls.length > 0
                    ? bike.photosUrls[0]
                    : '/placeholder.svg',
            isFavorite: bike.isFavorite || false,
            showEditButton: true,
        }))

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-blue"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">{error}</div>
                <Button onClick={() => window.location.reload()}>{t('retry')}</Button>
            </div>
        )
    }

    if (myBicycles.length === 0) {
        return (
            <div className="text-center py-12">
                <Bike className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noBicyclesYet')}</h3>
                <p className="text-gray-500 mb-6">{t('startSelling')}</p>
                <Button onClick={() => navigate('/upload')}>{t('addBicycle')}</Button>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('myBicycles')}</h2>
                <Button onClick={() => navigate('/upload')}>{t('addBicycle')}</Button>
            </div>

            <BicycleGrid bicycles={bicycleCardData} />
        </div>
    )
}

export default MyBicycles
