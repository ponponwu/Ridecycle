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

    const bicycleCardData: BicycleCardProps[] = myBicycles.map((bike) => ({
        id: bike.id,
        title: bike.title,
        price: bike.price,
        location: bike.location,
        condition: bike.condition,
        brand: bike.brand,
        imageUrl: bike.photosUrls && bike.photosUrls.length > 0 ? bike.photosUrls[0] : '/placeholder.svg',
        isFavorite: bike.isFavorite,
    }))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t('myBicycles')}</h3>
                <Button onClick={() => navigate('/upload')} variant="outline">
                    {t('publishNewBike')}
                </Button>
            </div>

            {isLoading && <div className="text-center py-12">{t('loadingYourBikes')}...</div>}
            {error && <div className="text-center py-12 text-red-500">Error: {error}</div>}

            {!isLoading && !error && (
                <>
                    {bicycleCardData.length > 0 ? (
                        <BicycleGrid bicycles={bicycleCardData} />
                    ) : (
                        <div className="text-center py-12 border rounded-lg bg-gray-50">
                            <Bike className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                {t('youHaveNotPublishedAnyBikes')}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">{t('startPublishingYourFirstBike')}</p>
                            <Button
                                className="mt-4 bg-marketplace-blue hover:bg-blue-600"
                                onClick={() => navigate('/upload')}
                            >
                                {t('publishNow')}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default MyBicycles
