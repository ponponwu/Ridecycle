import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BicycleWithOwner } from '@/types/bicycle.types'

interface BicycleInformationProps {
    bicycle: BicycleWithOwner
}

const BicycleInformation: React.FC<BicycleInformationProps> = ({ bicycle }) => {
    const { t } = useTranslation()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{t('admin.bicycleInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('title')}</label>
                        <p className="text-sm">{bicycle.title}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('price')}</label>
                        <p className="text-sm font-semibold text-green-600">${bicycle.price}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('brandLabel')}</label>
                        <p className="text-sm">{bicycle.brand?.name || t('admin.notProvided')}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('modelLabel')}</label>
                        <p className="text-sm">{bicycle.bicycle_model?.name || t('admin.notProvided')}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('yearLabel')}</label>
                        <p className="text-sm">{bicycle.year}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('bicycleTypeLabel')}</label>
                        <p className="text-sm">{bicycle.bicycleType}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('frameSizeLabel')}</label>
                        <p className="text-sm">{bicycle.frameSize}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('conditionLabel')}</label>
                        <p className="text-sm">{t(`conditionOptions.${bicycle.condition}`)}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('locationLabel')}</label>
                        <p className="text-sm">{bicycle.location}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('contactMethodLabel')}</label>
                        <p className="text-sm">{bicycle.contactMethod}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('admin.createdAt')}</label>
                        <p className="text-sm">{new Date(bicycle.createdAt).toLocaleDateString('zh-TW')}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('admin.updatedAt')}</label>
                        <p className="text-sm">{new Date(bicycle.updatedAt).toLocaleDateString('zh-TW')}</p>
                    </div>
                </div>

                {bicycle.description && (
                    <div>
                        <label className="text-sm font-medium text-gray-500">{t('descriptionLabel')}</label>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{bicycle.description}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default BicycleInformation
