import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { BicycleWithOwner } from '@/types/bicycle.types'

interface BicycleImageGalleryProps {
    bicycle: BicycleWithOwner
}

const BicycleImageGallery: React.FC<BicycleImageGalleryProps> = ({ bicycle }) => {
    const { t } = useTranslation()

    if (!bicycle.photosUrls || bicycle.photosUrls.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">{t('admin.images')}</h2>
                    <p className="text-gray-500">{t('admin.noImagesAvailable')}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('admin.images')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bicycle.photosUrls.map((imageUrl, index) => (
                        <div key={index} className="relative overflow-hidden rounded-md">
                            <AspectRatio ratio={1 / 1}>
                                <img
                                    src={imageUrl}
                                    alt={`${bicycle.title} - ${t('admin.image')} ${index + 1}`}
                                    className="object-cover w-full h-full"
                                />
                            </AspectRatio>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default BicycleImageGallery
