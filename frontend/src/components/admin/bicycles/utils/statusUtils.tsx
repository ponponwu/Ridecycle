import React from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

export const useStatusBadge = () => {
    const { t } = useTranslation()

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        {t('admin.pendingReview')}
                    </Badge>
                )
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 border-green-200">{t('admin.approved')}</Badge>
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 border-red-200">{t('admin.rejected')}</Badge>
            default:
                return null
        }
    }

    return {
        renderStatusBadge,
    }
}
