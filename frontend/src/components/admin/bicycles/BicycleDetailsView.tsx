import React from 'react'
import { useParams } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { useBicycleDetails } from './hooks/useBicycleDetails'
import { useStatusBadge } from './utils/statusUtils'
import BicycleDetailsHeader from './components/BicycleDetailsHeader'
import BicycleInformation from './components/BicycleInformation'
import BicycleImageGallery from './components/BicycleImageGallery'
import SellerCard from './components/SellerCard'
import AdminActions from './components/AdminActions'
import BicycleDetailsLoading from './components/BicycleDetailsLoading'
import BicycleDetailsNotFound from './components/BicycleDetailsNotFound'
import AdminLayout from '../AdminLayout'

const BicycleDetailsView: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const { bicycle, loading, handleApprove, handleReject } = useBicycleDetails(id || '')
    const { renderStatusBadge } = useStatusBadge()

    if (loading) {
        return (
            <AdminLayout>
                <BicycleDetailsLoading />
            </AdminLayout>
        )
    }

    if (!bicycle) {
        return (
            <AdminLayout>
                <BicycleDetailsNotFound />
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <BicycleDetailsHeader
                    bicycle={bicycle}
                    renderStatusBadge={renderStatusBadge}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <BicycleInformation bicycle={bicycle} />
                        <BicycleImageGallery bicycle={bicycle} />
                    </div>

                    <div className="space-y-6">
                        <SellerCard bicycle={bicycle} />
                        <AdminActions bicycle={bicycle} onApprove={handleApprove} onReject={handleReject} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default BicycleDetailsView
