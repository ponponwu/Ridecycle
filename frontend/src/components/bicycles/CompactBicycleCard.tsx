import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPriceNTD } from '@/utils/priceFormatter'
import { BicycleCardProps } from './BicycleCard'

const CompactBicycleCard = ({
    id,
    title,
    price,
    originalPrice,
    location,
    condition,
    brand,
    model,
    year,
    imageUrl,
    isFavorite = false,
}: BicycleCardProps) => {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col w-full max-w-[240px] sm:max-w-[260px]">
            <div className="relative">
                {/* Image - smaller aspect ratio */}
                <Link to={`/bicycle/${id}`} className="block aspect-[4/3] overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-bike.jpg'
                        }}
                    />
                </Link>

                {/* Heart button - smaller */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white w-7 h-7"
                >
                    <Heart className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </Button>

                {/* Condition badge */}
                <div className="absolute bottom-2 left-2">
                    <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        {condition}
                    </span>
                </div>
            </div>

            <div className="p-2.5 flex-grow">
                {/* Brand and Year */}
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {brand}
                    </span>
                    {year && (
                        <span className="text-xs text-gray-500">
                            {year}
                        </span>
                    )}
                </div>

                {/* Model/Title */}
                <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-1 leading-tight">
                    <Link to={`/bicycle/${id}`} className="hover:text-emerald-600 transition-colors">
                        {model || title}
                    </Link>
                </h3>

                {/* Location */}
                <div className="text-xs text-gray-500 mb-2">
                    📍 {location}
                </div>

                {/* Price */}
                <div className="space-y-0.5">
                    {originalPrice && originalPrice > price ? (
                        <>
                            <div className="text-xs text-gray-400 line-through">
                                {formatPriceNTD(originalPrice)}
                            </div>
                            <div className="text-lg font-bold text-red-600">
                                {formatPriceNTD(price)}
                            </div>
                        </>
                    ) : (
                        <div className="text-lg font-bold text-gray-900">
                            {formatPriceNTD(price)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CompactBicycleCard