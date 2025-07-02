import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import BicycleGrid from '@/components/bicycles/BicycleGrid'
import { BicycleCardProps } from '@/components/bicycles/BicycleCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, User, MapPin, Calendar, Package, Loader2 } from 'lucide-react'
import { bicycleService } from '@/api'
import { IBicycle } from '@/types/bicycle.types'
import { IBicycleUser } from '@/types/bicycle.types'
import { IBicycleListParams } from '@/types/bicycle.types'

interface SellerProfile extends IBicycleUser {
    memberSince?: string
    location?: string
    listingsCount?: number
}

const SellerProfile: React.FC = () => {
    const { sellerId } = useParams<{ sellerId: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [seller, setSeller] = useState<SellerProfile | null>(null)
    const [bicycles, setBicycles] = useState<BicycleCardProps[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest')

    useEffect(() => {
        if (sellerId) {
            loadSellerData(sellerId)
        }
    }, [sellerId, sortBy])

    // 將 IBicycle 轉換為 BicycleCardProps
    const transformBicycleToCardProps = (bicycle: IBicycle): BicycleCardProps => {
        return {
            id: bicycle.id,
            title: bicycle.title,
            price: bicycle.price,
            originalPrice: bicycle.original_price || bicycle.originalPrice,
            location: bicycle.location,
            condition: bicycle.condition,
            brand: bicycle.brand?.name || bicycle.brand_name || 'Unknown Brand',
            model: bicycle.bicycle_model?.name || bicycle.model_name,
            year: bicycle.year,
            frameSize: bicycle.frameSize,
            transmission: bicycle.transmission?.name || bicycle.transmission_name,
            imageUrl: bicycle.photos_urls?.[0] || bicycle.photosUrls?.[0] || '/placeholder-bike.jpg',
            isFavorite: bicycle.isFavorite,
        }
    }

    const loadSellerData = async (id: string) => {
        try {
            setIsLoading(true)
            setError(null)

            // 載入賣家的腳踏車 - 使用現有的 getBicycles 方法
            const searchParams: IBicycleListParams = {
                // 注意：這裡需要根據後端API的實際參數名稱調整
                // 可能需要檢查後端是否支援按賣家ID過濾
                sort: sortBy,
                status: ['available'], // 只顯示可購買的商品
                limit: 50,
            }

            // 暫時使用 getBicycles，然後在前端過濾
            const bicycleData = await bicycleService.getBicycles(searchParams)

            // 過濾出屬於該賣家的腳踏車
            const sellerBicycles = bicycleData.bicycles.filter((bicycle) => bicycle.seller?.id?.toString() === id)

            // 轉換為 BicycleCardProps 格式
            const transformedBicycles = sellerBicycles.map(transformBicycleToCardProps)
            setBicycles(transformedBicycles)

            // 從第一個腳踏車中取得賣家資訊
            if (sellerBicycles.length > 0) {
                const firstBicycle = sellerBicycles[0]
                const sellerInfo: SellerProfile = {
                    id: firstBicycle.seller?.id || parseInt(id),
                    name: firstBicycle.seller?.name || 'Unknown Seller',
                    full_name: firstBicycle.seller?.full_name,
                    created_at: firstBicycle.seller?.created_at,
                    memberSince: firstBicycle.seller?.created_at,
                    location: firstBicycle.location,
                    listingsCount: sellerBicycles.length,
                }
                setSeller(sellerInfo)
            } else {
                // 如果沒有找到該賣家的腳踏車，設置錯誤
                setError('此賣家沒有可用的商品')
            }
        } catch (error) {
            console.error('Failed to load seller data:', error)
            setError(error instanceof Error ? error.message : '載入賣家資訊失敗')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSortChange = (newSort: 'newest' | 'price_low' | 'price_high' | 'popular') => {
        setSortBy(newSort)
    }

    const getSortLabel = (sort: string) => {
        switch (sort) {
            case 'newest':
                return 'New to old'
            case 'price_low':
                return 'Price: Low to High'
            case 'price_high':
                return 'Price: High to Low'
            case 'popular':
                return 'Popular'
            default:
                return 'New to old'
        }
    }

    if (isLoading) {
        return (
            <MainLayout>
                <div className="container max-w-6xl mx-auto px-4 py-8">
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="ml-2">Loading seller information...</span>
                    </div>
                </div>
            </MainLayout>
        )
    }

    if (error || !seller) {
        return (
            <MainLayout>
                <div className="container max-w-6xl mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-4">{error || 'Seller not found'}</div>
                        <Button onClick={() => navigate(-1)} variant="outline">
                            Go Back
                        </Button>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="container max-w-6xl mx-auto px-4 py-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to {seller.name}'s listing
                    </Button>
                </div>

                {/* Seller Profile Card */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <User className="w-12 h-12 text-gray-500" />
                            </div>

                            {/* Seller Info */}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {seller.full_name || seller.name}
                                </h1>

                                <div className="space-y-2">
                                    {seller.location && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{seller.location}</span>
                                        </div>
                                    )}

                                    {seller.memberSince && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Member since{' '}
                                                {new Date(seller.memberSince).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Listings Section */}
                <div className="space-y-6">
                    {/* Listings Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-semibold">Listings</h2>
                            <span className="text-gray-500">
                                {bicycles.length} listing{bicycles.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    handleSortChange(
                                        e.target.value as 'newest' | 'price_low' | 'price_high' | 'popular'
                                    )
                                }
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white"
                            >
                                <option value="newest">New to old</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="popular">Popular</option>
                            </select>
                        </div>
                    </div>

                    {/* Bicycles Grid */}
                    {bicycles.length > 0 ? (
                        <BicycleGrid bicycles={bicycles} />
                    ) : (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings available</h3>
                            <p className="text-gray-500">
                                This seller doesn't have any available listings at the moment.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}

export default SellerProfile
