import { Link, useNavigate } from 'react-router-dom'
import { Heart, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPriceNTD } from '@/utils/priceFormatter'

export interface BicycleCardProps {
    id: string
    title: string
    price: number
    originalPrice?: number
    location: string
    condition: string
    brand: string
    model?: string
    year?: string
    frameSize?: string
    transmission?: string
    imageUrl: string
    isFavorite?: boolean
    showEditButton?: boolean
}

const BicycleCard = ({
    id,
    title,
    price,
    originalPrice,
    brand,
    model,
    year,
    frameSize,
    transmission,
    imageUrl,
    isFavorite = false,
    showEditButton = false,
}: BicycleCardProps) => {
    const navigate = useNavigate()

    const handleEdit = () => {
        navigate(`/upload/${id}/edit`)
    }

    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
            <div className="relative">
                {/* Image */}
                <Link to={`/bicycle/${id}`} className="block aspect-[4/3] overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-bike.jpg' // Fallback image
                        }}
                    />
                </Link>

                {/* Heart button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white w-8 h-8"
                >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </Button>
            </div>

            <div className="p-3 flex-grow">
                {/* Top row: Year, Size, Transmission */}
                {(year || frameSize || transmission) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {year && <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">{year}</span>}
                        {frameSize && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">{frameSize}</span>
                        )}
                        {transmission && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">{transmission}</span>
                        )}
                    </div>
                )}

                {/* Brand */}
                <div className="text-sm font-medium text-gray-700 mb-1">{brand}</div>

                {/* Model/Title */}
                <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-1">
                    <Link to={`/bicycle/${id}`} className="hover:text-marketplace-blue transition-colors">
                        {model || title}
                    </Link>
                </h3>

                {/* Price */}
                <div className="space-y-1">
                    {originalPrice && originalPrice > price ? (
                        <>
                            <div className="text-sm text-gray-400 line-through">{formatPriceNTD(originalPrice)}</div>
                            <div className="text-xl font-bold text-red-600">{formatPriceNTD(price)}</div>
                        </>
                    ) : (
                        <div className="text-xl font-bold text-gray-900">{formatPriceNTD(price)}</div>
                    )}
                </div>
            </div>

            {showEditButton && (
                <div className="p-3 border-t border-gray-100">
                    <Button onClick={handleEdit} variant="outline" className="w-full">
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Bicycle
                    </Button>
                </div>
            )}
        </div>
    )
}

export default BicycleCard
