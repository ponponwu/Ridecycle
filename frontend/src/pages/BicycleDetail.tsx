import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
import { useAuth } from '@/contexts/AuthContext' // 新增 useAuth 引入
import { Button } from '@/components/ui/button'
import { translateBicycleCondition, translateBicycleType } from '@/utils/bicycleTranslations'

// Removed sample bicycleData

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
                <div className="container px-4 py-8 mx-auto text-center">Bicycle not found.</div>
            </MainLayout>
        )
    }

    // Assuming bicycle.bicycleType is a string like "Road Bike" from the backend
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
                    {/* Ensure bicycle.bicycleType is a string before using in URL */}
                    <Link
                        to={`/search?category=${encodeURIComponent(bicycle.bicycleType || '')}`}
                        className="hover:text-marketplace-blue"
                    >
                        {translateBicycleType(bicycle.bicycleType, t) || 'N/A'}
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
                            condition={translateBicycleCondition(bicycle.condition, t)}
                            brand={bicycle.brand?.name || 'Unknown Brand'}
                            category={translateBicycleType(bicycle.bicycleType, t)}
                            price={bicycle.price}
                            location={bicycle.location}
                            bicycle={bicycle} // Pass the whole bicycle object if needed by the component
                        />

                        {/* Make Offer Button */}
                        {(!currentUser || currentUser.id.toString() !== bicycle.seller?.id.toString()) && (
                            <div className="mt-4">
                                <MakeOfferDialog
                                    bicycleTitle={bicycle.title}
                                    bicycleId={id || ''}
                                    currentUser={currentUser}
                                    sellerId={bicycle.seller?.id.toString()}
                                    bicycleStatus={bicycle.status}
                                />
                            </div>
                        )}

                        {/* Specifications */}
                        <BicycleSpecifications
                            brand={bicycle.brand?.name || 'Unknown Brand'}
                            model={bicycle.bicycle_model?.name || 'N/A'}
                            year={parseInt(bicycle.year, 10)} // Assuming bicycle.year is string, convert to number
                            frameSize={bicycle.frameSize}
                            wheelSize={bicycle.wheelSize || 'N/A'} // Provide fallback for optional fields
                            yearsOfUse={bicycle.yearsOfUse} // This is optional in both interfaces
                        />

                        {/* Seller Information */}
                        <SellerInformation
                            sellerName={bicycle.seller?.full_name || bicycle.seller?.name || 'N/A'}
                            sellerRating={bicycle.sellerRating} // This was in IBicycle, keep if still relevant
                        />

                        {/* Contact Form */}
                        {bicycle.seller &&
                            bicycle.id &&
                            (!currentUser || currentUser.id.toString() !== bicycle.seller.id.toString()) && (
                                <ContactSellerForm
                                    sellerId={bicycle.seller.id.toString()}
                                    bicycleId={bicycle.id.toString()}
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
