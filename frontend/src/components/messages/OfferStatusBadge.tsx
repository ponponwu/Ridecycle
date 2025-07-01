import React from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Ban } from 'lucide-react'

interface OfferStatusBadgeProps {
    status: 'pending' | 'accepted' | 'rejected' | 'expired'
    isActive?: boolean
}

const OfferStatusBadge: React.FC<OfferStatusBadgeProps> = ({ status, isActive = false }) => {
    const { t } = useTranslation()

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    text: t('messagesPage.pending'),
                    variant: 'secondary' as const,
                    icon: <Clock className="h-3 w-3" />,
                    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                }
            case 'accepted':
                return {
                    text: t('messagesPage.accepted'),
                    variant: 'default' as const,
                    icon: <CheckCircle className="h-3 w-3" />,
                    className: 'bg-green-100 text-green-800 border-green-200',
                }
            case 'rejected':
                return {
                    text: t('messagesPage.rejected'),
                    variant: 'destructive' as const,
                    icon: <XCircle className="h-3 w-3" />,
                    className: 'bg-red-100 text-red-800 border-red-200',
                }
            case 'expired':
                return {
                    text: t('messagesPage.expired'),
                    variant: 'outline' as const,
                    icon: <Ban className="h-3 w-3" />,
                    className: 'bg-gray-100 text-gray-600 border-gray-200',
                }
            default:
                return {
                    text: t('unknown'),
                    variant: 'outline' as const,
                    icon: null,
                    className: 'bg-gray-100 text-gray-600 border-gray-200',
                }
        }
    }

    const config = getStatusConfig(status)

    return (
        <Badge
            variant={config.variant}
            className={`inline-flex items-center gap-1 text-xs ${config.className} ${isActive ? 'animate-pulse' : ''}`}
        >
            {config.icon}
            {config.text}
        </Badge>
    )
}

export default OfferStatusBadge
