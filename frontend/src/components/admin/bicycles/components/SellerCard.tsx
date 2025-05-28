import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { BicycleWithOwner } from '@/types/bicycle.types'

interface SellerCardProps {
    bicycle: BicycleWithOwner
}

const SellerCard: React.FC<SellerCardProps> = ({ bicycle }) => {
    const { t } = useTranslation()

    // 統一使用 seller 物件
    const seller = bicycle.seller

    return (
        <Card>
            <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('admin.sellerInformation')}</h2>
                <div className="flex items-center space-x-4">
                    {seller?.avatar_url ? (
                        <img
                            src={seller.avatar_url}
                            alt={seller.full_name || seller.name}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                                {(seller?.full_name || seller?.name)?.charAt(0) || 'U'}
                            </span>
                        </div>
                    )}
                    <div>
                        <p className="font-medium">{seller?.full_name || seller?.name || t('admin.unknownUser')}</p>
                        <p className="text-sm text-gray-500">
                            {t('admin.userId')}: {bicycle.user_id}
                        </p>
                        {seller?.email && <p className="text-sm text-gray-500">{seller.email}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SellerCard
