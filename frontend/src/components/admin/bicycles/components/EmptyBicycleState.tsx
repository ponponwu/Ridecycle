import React from 'react'
import { useTranslation } from 'react-i18next'

interface EmptyBicycleStateProps {
    status: string
    isEmpty: boolean
}

const EmptyBicycleState: React.FC<EmptyBicycleStateProps> = ({ status, isEmpty }) => {
    const { t } = useTranslation()

    if (!isEmpty) return null

    return (
        <div className="text-center py-8 bg-white rounded-lg border">
            <p className="text-gray-500">
                {status === 'pending'
                    ? t('admin.noPendingBicycles')
                    : `${t('no')} ${t(status.toLowerCase())} ${t('bicycles')}`}
            </p>
        </div>
    )
}

export default EmptyBicycleState
