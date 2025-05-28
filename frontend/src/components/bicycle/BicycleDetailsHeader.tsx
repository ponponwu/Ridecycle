import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, MapPin, Star } from 'lucide-react'
import { IBicycle } from '@/types/bicycle.types'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface BicycleDetailsHeaderProps {
    title: string
    condition: string
    brand: string
    category: string
    price: number
    location: string
    bicycle: IBicycle
}

const BicycleDetailsHeader: React.FC<BicycleDetailsHeaderProps> = ({
    title,
    condition,
    brand,
    category,
    price,
    location,
    bicycle,
}: BicycleDetailsHeaderProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const handleBuyNow = () => {
        navigate('/checkout', { state: { bicycle } })
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

            <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {condition}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{brand}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{category}</span>
            </div>

            <div className="text-3xl font-bold text-marketplace-green">{formatPriceNTD(price)}</div>

            <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{location}</span>
            </div>

            {bicycle.sellerRating && (
                <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                        {bicycle.sellerRating} ({t('seller')} rating)
                    </span>
                </div>
            )}

            {bicycle && (
                <Button className="mt-4 w-full sm:w-auto" onClick={handleBuyNow}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t('buyNow')}
                </Button>
            )}
        </div>
    )
}

export default BicycleDetailsHeader
