import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import HeroBanner from '@/components/home/HeroBanner'
import SearchSection from '@/components/home/SearchSection'
import FeaturedSection from '@/components/home/FeaturedSection'
import RecentlyAddedSection from '@/components/home/RecentlyAddedSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import TestimonialSection from '@/components/home/TestimonialSection'
import CallToAction from '@/components/home/CallToAction'
import { bicycleService } from '@/api' // Import bicycleService
import { IBicycle } from '@/types/bicycle.types' // Import IBicycle type
import BicycleGrid from '@/components/bicycles/BicycleGrid' // Import BicycleGrid
import { BicycleCardProps } from '@/components/bicycles/BicycleCard' // Import BicycleCardProps
import { Button } from '@/components/ui/button' // For a potential "View More" button
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react'

const Index = () => {
    const { t } = useTranslation()
    const [allBicycles, setAllBicycles] = useState<IBicycle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBicycles = async () => {
            try {
                setIsLoading(true)
                // Assuming getBicycles returns IBicycleListResponse which has a 'bicycles' array
                const response = await bicycleService.getBicycles({ limit: 8 }) // Fetch initial set, e.g., 8 bikes
                console.log('response', response)
                setAllBicycles(response.bicycles)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch bicycles:', err)
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError('An unknown error occurred.')
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchBicycles()
    }, [])

    // Transform IBicycle[] to BicycleCardProps[]
    const bicycleCardData: BicycleCardProps[] =
        allBicycles
            ?.filter((bike) => bike && bike.id) // 過濾掉無效的資料
            ?.map((bike) => ({
                id: bike.id ? bike.id.toString() : '',
                title: bike.title || 'Unknown Title',
                price: typeof bike.price === 'number' ? bike.price : 0,
                originalPrice: bike.original_price || bike.bicycle_model?.original_msrp || bike.originalPrice,
                location: bike.location || 'Unknown Location',
                condition: bike.condition || 'unknown',
                brand: bike.brand_name || bike.brand?.name || 'Unknown Brand', // Handle brand object
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
            })) || []

    return (
        <MainLayout>
            {/* Hero Banner */}
            <HeroBanner />

            {/* Search Section */}
            <SearchSection />

            {/* All Bicycles Section */}
            <section className="py-16 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('exploreAllBicycles')}</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            發現各種高品質的二手自行車，從專業公路車到輕鬆的城市車應有盡有
                        </p>
                        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-6 rounded-full"></div>
                    </div>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
                            <p className="text-lg text-gray-600">{t('loadingBicycles')}</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-lg text-red-600 mb-4">載入失敗: {error}</p>
                            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
                                重新載入
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <>
                            {bicycleCardData.length > 0 ? (
                                <div className="space-y-8">
                                    <BicycleGrid bicycles={bicycleCardData} />
                                    <div className="text-center">
                                        <Link to="/search">
                                            <Button
                                                size="lg"
                                                className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                查看更多自行車
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg
                                            className="w-12 h-12 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">暫無自行車</h3>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('noBicyclesFound')}</p>
                                    <Link to="/upload">
                                        <Button size="lg" className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                                            成為第一個賣家
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Other Sections */}
            <FeaturedSection />
            <HowItWorksSection />
            <RecentlyAddedSection />
            <TestimonialSection />
            <CallToAction />
        </MainLayout>
    )
}

export default Index
