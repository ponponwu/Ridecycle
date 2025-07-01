import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { bicycleService } from '@/api' // Import bicycleService
import { IBicycle } from '@/types/bicycle.types' // Import IBicycle type
import MainLayout from '@/components/layout/MainLayout'
import BicycleImageGallery from '@/components/bicycle/BicycleImageGallery'
import MakeOfferDialog from '@/components/bicycle/MakeOfferDialog'
import ContactSellerForm from '@/components/bicycle/ContactSellerForm'
import { useAuth } from '@/contexts/AuthContext' // 新增 useAuth 引入
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { translateBicycleCondition, translateBicycleType } from '@/utils/bicycleTranslations'
import { formatPriceNTD } from '@/utils/priceFormatter'
import { MapPin, User, Calendar, Settings, Package, Info, Heart, Share } from 'lucide-react'

const BicycleDetail = () => {
    const { id } = useParams<{ id: string }>()
    const { t } = useTranslation()
    const [bicycle, setBicycle] = useState<IBicycle | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { currentUser } = useAuth() // 取得登入用戶
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBicycleDetails = async () => {
            if (!id) {
                setError('Bicycle ID is missing.')
                setIsLoading(false)
                return
            }
            try {
                setIsLoading(true)
                const data = await bicycleService.getBicycleById(id)
                console.log('Bicycle details:', data)
                setBicycle(data)
                setError(null)
            } catch (err) {
                console.error(`Failed to fetch bicycle details for ID ${id}:`, err)
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError('An unknown error occurred while fetching bicycle details.')
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchBicycleDetails()
    }, [id])

    if (isLoading) {
        return (
            <MainLayout>
                <div className="container px-4 py-8 mx-auto text-center">Loading bicycle details...</div>
            </MainLayout>
        )
    }

    if (error) {
        return (
            <MainLayout>
                <div className="container px-4 py-8 mx-auto text-center text-red-500">Error: {error}</div>
            </MainLayout>
        )
    }

    if (!bicycle) {
        return (
            <MainLayout>
                <div className="container px-4 py-8 mx-auto text-center">{t('bicycleNotFound')}</div>
            </MainLayout>
        )
    }

    const isOwner = currentUser && bicycle.seller && currentUser.id.toString() === bicycle.seller.id.toString()

    return (
        <MainLayout>
            <div className="container px-4 py-8 mx-auto max-w-7xl">
                {/* Breadcrumb */}
                <nav className="flex mb-6 text-sm text-gray-500">
                    <Link to="/" className="hover:text-marketplace-blue">
                        {t('home')}
                    </Link>
                    <span className="mx-2">/</span>
                    <Link to="/search" className="hover:text-marketplace-blue">
                        {t('search')}
                    </Link>
                    <span className="mx-2">/</span>
                    <Link
                        to={`/search?category=${encodeURIComponent(bicycle.bicycleType || '')}`}
                        className="hover:text-marketplace-blue"
                    >
                        {translateBicycleType(bicycle.bicycleType, t) || 'N/A'}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">{bicycle.title}</span>
                </nav>

                {/* Main Content - 7:3 Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                    {/* Left Column - Bicycle Information (7/10) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Image Gallery */}
                        <div>
                            <BicycleImageGallery
                                images={bicycle.photos_urls || bicycle.photosUrls || []}
                                title={bicycle.title}
                            />
                        </div>

                        {/* General Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    {t('generalInformation')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">{t('conditionLabel')}</dt>
                                            <dd className="mt-1 flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    {translateBicycleCondition(bicycle.condition, t)}
                                                </Badge>
                                                <Info className="h-4 w-4 text-gray-400" />
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">{t('frameSizeLabel')}</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{bicycle.frameSize || 'N/A'}</dd>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">{t('yearLabel')}</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{bicycle.year || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">{t('fitsToHeight')}</dt>
                                            <dd className="mt-1 flex items-center gap-2">
                                                <span className="text-sm text-gray-900">
                                                    {bicycle.specifications?.height_range ||
                                                        t('contactSellerForDetails')}
                                                </span>
                                                <Info className="h-4 w-4 text-gray-400" />
                                            </dd>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bike Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('bikeDetails')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600">{t('informationFromSeller')}</p>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-900">
                                            {bicycle.description || t('noAdditionalDetails')}
                                        </p>
                                    </div>
                                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        <Package className="h-4 w-4" />
                                        {t('showOriginal')}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Purchase & Seller Info (3/10) */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Brand and Model Header */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h1 className="text-lg font-medium text-gray-600">
                                    {bicycle.brand?.name || bicycle.brand_name || 'Unknown Brand'}
                                </h1>
                                <Share className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {bicycle.bicycle_model?.name || bicycle.model_name || bicycle.title}
                            </h2>

                            {/* Specifications Tags */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {bicycle.year && (
                                    <Badge variant="outline" className="text-xs">
                                        {bicycle.year}
                                    </Badge>
                                )}
                                {bicycle.frameSize && (
                                    <Badge variant="outline" className="text-xs">
                                        {bicycle.frameSize}
                                    </Badge>
                                )}
                                {(bicycle.transmission?.name || bicycle.transmission_name) && (
                                    <Badge variant="outline" className="text-xs">
                                        {bicycle.transmission?.name || bicycle.transmission_name}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-gray-900">
                                    {formatPriceNTD(bicycle.price)}
                                </span>
                                {bicycle.original_price && bicycle.original_price > bicycle.price && (
                                    <span className="text-lg text-gray-400 line-through">
                                        {formatPriceNTD(bicycle.original_price)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {!isOwner && (
                            <div className="space-y-3">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={() => navigate('/checkout', { state: { bicycle } })}
                                >
                                    {t('comfirmAndCheckout')}
                                </Button>
                                <div className="flex gap-2">
                                    <MakeOfferDialog
                                        bicycleTitle={bicycle.title}
                                        bicycleId={id || ''}
                                        currentUser={currentUser}
                                        sellerId={bicycle.seller?.id.toString()}
                                        bicycleStatus={bicycle.status}
                                    />
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Heart className="h-4 w-4 mr-1" />
                                        35
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Buyer Protection Info */}
                        <Card className="bg-gray-50">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Package className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-900">{t('buyerProtection')}</p>
                                        <button className="text-sm text-blue-600 hover:text-blue-800">
                                            {t('learnMoreBuyerProtection')}
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seller Information */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-6 w-6 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">{t('soldBy')}</p>
                                            <p className="font-medium text-gray-900">
                                                {bicycle.seller?.name ||
                                                    bicycle.seller?.full_name ||
                                                    t('anonymousSeller')}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3 text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    {bicycle.location || t('locationNotSpecified')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {!isOwner && (
                                        <ContactSellerForm
                                            sellerId={bicycle.seller?.id.toString() || ''}
                                            bicycleId={bicycle.id.toString()}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Info */}
                        <Card className="bg-blue-50">
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-blue-900">{t('ownOneLikeThis')}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Report Link */}
                        <div className="text-center">
                            <button className="text-sm text-gray-500 hover:text-gray-700 underline">
                                {t('reportSuspicious')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default BicycleDetail
