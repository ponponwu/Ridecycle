import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { translateBicycleCondition } from '@/utils/bicycleTranslations'

export interface BicycleCardProps {
    id: string
    title: string
    price: number
    location: string
    condition: string
    brand: string
    imageUrl: string
    isFavorite?: boolean
    showEditButton?: boolean
}

const BicycleCard = ({
    id,
    title,
    price,
    location,
    condition,
    brand,
    imageUrl,
    isFavorite = false,
    showEditButton = false,
}: BicycleCardProps) => {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const handleEdit = () => {
        navigate(`/upload/${id}/edit`)
    }

    return (
        <div className="bg-white rounded-lg overflow-hidden bicycle-card-shadow transition-all duration-300 hover:shadow-lg flex flex-col">
            <div className="relative">
                {/* Image */}
                <Link to={`/bicycle/${id}`} className="block aspect-[4/3] overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                </Link>

                {/* Bookmark button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
                >
                    <Bookmark
                        className={isFavorite ? 'h-5 w-5 fill-marketplace-orange text-marketplace-orange' : 'h-5 w-5'}
                    />
                </Button>

                {/* Condition tag */}
                <Badge
                    variant="secondary"
                    className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm text-gray-800"
                >
                    {translateBicycleCondition(condition, t)}
                </Badge>
            </div>

            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg line-clamp-2">
                        <Link to={`/bicycle/${id}`} className="hover:text-marketplace-blue transition-colors">
                            {title}
                        </Link>
                    </h3>
                    <span className="text-lg font-semibold text-marketplace-green">${price}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>{brand}</span>
                    <span>{location}</span>
                </div>
            </div>
            {showEditButton && (
                <div className="p-4 border-t border-gray-100">
                    <Button onClick={handleEdit} variant="outline" className="w-full">
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Bicycle
                    </Button>
                </div>
            )}
        </div>
    )
}

export default BicycleCard
