import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { bicycleService } from '@/api' // Import bicycleService
import { IBicycle } from '@/types/bicycle.types' // Import IBicycle type
import MainLayout from '@/components/layout/MainLayout'
import BicycleImageGallery from '@/components/bicycle/BicycleImageGallery'
import BicycleDetailsHeader from '@/components/bicycle/BicycleDetailsHeader'
import BicycleSpecifications from '@/components/bicycle/BicycleSpecifications'
import SellerInformation from '@/components/bicycle/SellerInformation'
import ContactSellerForm from '@/components/bicycle/ContactSellerForm'
import MakeOfferDialog from '@/components/bicycle/MakeOfferDialog'
import BicycleDescription from '@/components/bicycle/BicycleDescription'

// Removed sample bicycleData

const BicycleDetail = () => {
    const { id } = useParams<{ id: string }>()
    const { t } = useTranslation()
    const [bicycle, setBicycle] = useState<IBicycle | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
                <div className="container px-4 py-8 mx-auto text-center">Bicycle not found.</div>
            </MainLayout>
        )
    }

    // Assuming bicycle.bikeType is a string like "Road Bike" from the backend
    // and bicycle.user.name exists
    return (
        <MainLayout>
            <div className="container px-4 py-8 mx-auto">
                {/* Breadcrumb */}
                <nav className="flex mb-5 text-sm text-gray-500">
                    <Link to="/" className="hover:text-marketplace-blue">
                        {t('home')}
                    </Link>
                    <span className="mx-2">/</span>
                    <Link to="/search" className="hover:text-marketplace-blue">
                        {t('search')}
                    </Link>
                    <span className="mx-2">/</span>
                    {/* Ensure bicycle.bikeType is a string before using in URL */}
                    <Link
                        to={`/search?category=${encodeURIComponent(bicycle.bikeType || '')}`}
                        className="hover:text-marketplace-blue"
                    >
                        {bicycle.bikeType || 'N/A'}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">{bicycle.title}</span>
                </nav>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div>
                        <BicycleImageGallery
                            images={bicycle.photosUrls || []} // Changed to photosUrls
                            title={bicycle.title}
                        />
                    </div>

                    {/* Bicycle Details */}
                    <div>
                        <BicycleDetailsHeader
                            title={bicycle.title}
                            condition={bicycle.condition} // Assuming string
                            brand={bicycle.brand}
                            category={bicycle.bikeType} // Assuming string
                            price={bicycle.price}
                            location={bicycle.location}
                            bicycle={bicycle} // Pass the whole bicycle object if needed by the component
                        />

                        {/* Make Offer Button */}
                        <div className="mt-4">
                            {/* Ensure id is not undefined before passing */}
                            <MakeOfferDialog bicycleTitle={bicycle.title} bicycleId={id || ''} />
                        </div>

                        {/* Specifications */}
                        <BicycleSpecifications
                            brand={bicycle.brand}
                            model={bicycle.model}
                            year={parseInt(bicycle.year, 10)} // Assuming bicycle.year is string, convert to number
                            frameSize={bicycle.frameSize}
                            wheelSize={bicycle.wheelSize || 'N/A'} // Provide fallback for optional fields
                            // yearsOfUse is not in IBicycle, remove or add to IBicycle if needed
                        />

                        {/* Seller Information */}
                        <SellerInformation
                            sellerName={bicycle.user?.name || 'N/A'} // Use user object
                            sellerRating={bicycle.sellerRating} // This was in IBicycle, keep if still relevant
                        />

                        {/* Contact Form */}
                        {bicycle.user && bicycle.id && (
                            <ContactSellerForm
                                sellerId={bicycle.user.id.toString()} // Convert number to string
                                bicycleId={bicycle.id}
                            />
                        )}
                    </div>
                </div>

                {/* Description */}
                <BicycleDescription description={bicycle.description} />
            </div>
        </MainLayout>
    )
}

export default BicycleDetail
