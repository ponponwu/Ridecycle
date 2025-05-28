import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, X } from 'lucide-react'
import { BicycleWithOwner } from '@/types/bicycle.types'

interface BicycleDetailsHeaderProps {
    bicycle: BicycleWithOwner
    renderStatusBadge: (status: string) => React.ReactNode
    onApprove: () => void
    onReject: () => void
}

const BicycleDetailsHeader: React.FC<BicycleDetailsHeaderProps> = ({
    bicycle,
    renderStatusBadge,
    onApprove,
    onReject,
}) => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigate('/admin/bicycles')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('back')}
            </Button>

            <div className="flex space-x-2">
                {bicycle.status === 'pending' ? (
                    <>
                        <Button
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            onClick={onApprove}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            {t('approve')}
                        </Button>

                        <Button
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            onClick={onReject}
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t('reject')}
                        </Button>
                    </>
                ) : (
                    <div>{renderStatusBadge(bicycle.status)}</div>
                )}
            </div>
        </div>
    )
}

export default BicycleDetailsHeader
