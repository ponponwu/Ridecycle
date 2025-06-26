import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface ChatHeaderProps {
    bicycleName: string
    bicycleImage?: string
    bicyclePrice: number
    bicycleId?: string | number
    currency?: string
    onBack: () => void
}

const ChatHeader = ({ bicycleName, bicycleImage, bicyclePrice, bicycleId, currency, onBack }: ChatHeaderProps) => {
    return (
        <div className="flex items-center p-4 bg-white border-b border-gray-200">
            <button onClick={onBack} className="mr-3 p-1 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="h-5 w-5" />
            </button>

            {bicycleImage && (
                <img src={bicycleImage} alt={bicycleName} className="w-10 h-10 rounded-lg object-cover mr-3" />
            )}

            <div className="flex-1">
                {bicycleId ? (
                    <Link
                        to={`/bicycle/${bicycleId}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                        {bicycleName}
                    </Link>
                ) : (
                    <h3 className="font-medium text-gray-900">{bicycleName}</h3>
                )}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{formatPriceNTD(bicyclePrice)}</span>
                </div>
            </div>
        </div>
    )
}

export default ChatHeader
