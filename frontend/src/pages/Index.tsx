import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

const Index = () => {
    const [allBicycles, setAllBicycles] = useState<IBicycle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBicycles = async () => {
            try {
                setIsLoading(true)
                // Assuming getBicycles returns IBicycleListResponse which has a 'bicycles' array
                const response = await bicycleService.getBicycles({ limit: 8 }) // Fetch initial set, e.g., 8 bikes
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
        allBicycles?.map((bike) => ({
            id: bike.id,
            title: bike.title,
            price: bike.price,
            location: bike.location,
            condition: bike.condition,
            brand: bike.brand,
            imageUrl: bike.photosUrls && bike.photosUrls.length > 0 ? bike.photosUrls[0] : '/placeholder.svg',
            isFavorite: bike.isFavorite,
        })) || []

    return (
        <MainLayout>
            <HeroBanner />
            <SearchSection />

            {/* All Bicycles Section */}
            <section className="py-8 container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Explore All Bicycles</h2>
                {isLoading && <div className="text-center">Loading bicycles...</div>}
                {error && <div className="text-center text-red-500">Error: {error}</div>}
                {!isLoading && !error && (
                    <>
                        {bicycleCardData.length > 0 ? (
                            <BicycleGrid bicycles={bicycleCardData} />
                        ) : (
                            <p className="text-center text-gray-600">
                                No bicycles found at the moment. Check back soon!
                            </p>
                        )}
                        {/* Optional: Add a "View More" button or pagination if not all bikes are loaded initially */}
                        {/* Example:
            {allBicycles.length > 0 && ( // Assuming you might have more bikes than initially loaded
              <div className="text-center mt-8">
                <Link to="/search">
                  <Button variant="outline">View More Bicycles</Button>
                </Link>
              </div>
            )}
            */}
                    </>
                )}
            </section>

            <FeaturedSection />
            <HowItWorksSection />
            <RecentlyAddedSection />
            <TestimonialSection />
            <CallToAction />
        </MainLayout>
    )
}

export default Index
