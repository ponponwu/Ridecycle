import React from 'react'
import { useTranslation } from 'react-i18next'

interface EmptyBicycleStateProps {
    status: string
    isEmpty: boolean
}

const EmptyBicycleState: React.FC<EmptyBicycleStateProps> = ({ status, isEmpty }) => {
    const { t } = useTranslation()

    if (!isEmpty) return null

    const getEmptyMessage = () => {
        switch (status) {
            case 'pending':
                return t('admin.noPendingBicycles')
            case 'draft':
                return t('admin.noDraftBicycles')
            case 'available':
                return t('admin.noAvailableBicycles')
            case 'archived':
                return t('admin.noArchivedBicycles')
            default:
                return `沒有 ${status} 狀態的自行車`
        }
    }

    return (
        <div className="text-center py-8 bg-white rounded-lg border">
            <p className="text-gray-500">{getEmptyMessage()}</p>
        </div>
    )
}

export default EmptyBicycleState
