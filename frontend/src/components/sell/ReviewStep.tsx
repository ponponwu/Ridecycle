import React, { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { EditBikeFormValues } from '@/pages/EditBike'
import { useTranslation } from 'react-i18next'
import { BicycleCondition } from '@/types/bicycle.types'
import { getConditionI18nKey } from '@/constants/conditions'
import { translateBicycleType } from '@/utils/bicycleTranslations'
import { formatPriceNTD } from '@/utils/priceFormatter'

export interface ReviewStepProps {
    form: UseFormReturn<EditBikeFormValues>
    isEditMode?: boolean
}

const ReviewStep = ({ form, isEditMode = false }: ReviewStepProps) => {
    const { t } = useTranslation()
    const formValues = form.getValues()

    const contactMethods = {
        app: t('inAppMessagingOption'),
        email: t('emailOption'),
        phone: t('phoneCallOption'),
        text: t('textMessageOption'),
    }

    const getDisplayPhotos = () => {
        const displayItems: { id: string; url: string; isNew: boolean }[] = []

        if (formValues.existingPhotos) {
            formValues.existingPhotos.forEach((p) => {
                if (!formValues.photosToDelete.includes(p.id)) {
                    displayItems.push({ ...p, isNew: false })
                }
            })
        }

        if (formValues.photos) {
            formValues.photos.forEach((file, index) => {
                if (file instanceof File) {
                    displayItems.push({
                        id: `new-${index}-${file.name}`,
                        url: URL.createObjectURL(file),
                        isNew: true,
                    })
                }
            })
        }
        return displayItems
    }

    const displayPhotos = getDisplayPhotos()

    useEffect(() => {
        // Cleanup function to revoke Object URLs when component unmounts or displayPhotos changes
        const urlsToRevoke = displayPhotos
            .filter((item) => item.isNew && item.url.startsWith('blob:'))
            .map((item) => item.url)
        return () => {
            urlsToRevoke.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [displayPhotos])

    return (
        <>
            <div className="space-y-6">
                <div className="pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEditMode ? t('reviewYourChanges') : t('reviewYourListing')}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('reviewBeforeText')} {isEditMode ? t('savingChanges') : t('submittingListing')}.
                    </p>
                </div>

                <section>
                    <h3 className="text-md font-medium text-gray-900 mb-3">{t('bikeDetailsHeading')}</h3>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">{t('titleLabel')}</h4>
                                    <p className="text-sm">{formValues.title || t('notAvailable')}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">{t('brand')}</h4>
                                    <p className="text-sm">{formValues.brandName || t('notAvailable')}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">{t('transmissionSystem')}</h4>
                                    <p className="text-sm">{formValues.transmissionName || t('notAvailable')}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">{t('year')}</h4>
                                    <p className="text-sm">{formValues.year || t('notAvailable')}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">{t('bicycleType')}</h4>
                                    <p className="text-sm">
                                        {formValues.bicycleType
                                            ? translateBicycleType(formValues.bicycleType, t)
                                            : t('notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">{t('frameSize')}</h4>
                                    <p className="text-sm">{formValues.frameSize || t('notAvailable')}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-medium text-gray-500">{t('description')}</h4>
                                <p className="text-sm line-clamp-3">{formValues.description || t('notAvailable')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h3 className="text-md font-medium text-gray-900 mb-3">{t('photosAndCondition')}</h3>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-2">{t('photos')}</h4>
                                {displayPhotos.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {displayPhotos.map((item) => (
                                            <div
                                                key={item.id}
                                                className="aspect-square rounded-md overflow-hidden bg-gray-50"
                                            >
                                                <img
                                                    src={item.url}
                                                    alt={`Bike photo ${item.id}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-500">{t('noPhotosWillBeShown')}</p>
                                )}
                            </div>

                            <div>
                                <h4 className="text-xs font-medium text-gray-500">{t('conditionLabel')}</h4>
                                <p className="text-sm">
                                    {formValues.condition
                                        ? t(getConditionI18nKey(formValues.condition as BicycleCondition))
                                        : t('notProvided')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h3 className="text-md font-medium text-gray-900 mb-3">{t('pricingAndLocation')}</h3>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">{t('askingPrice')}</h4>
                                    <p className="text-sm font-medium">
                                        {formValues.price ? formatPriceNTD(formValues.price) : t('notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">{t('location')}</h4>
                                    <p className="text-sm">{formValues.location || t('notAvailable')}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">{t('contactMethodLabel')}</h4>
                                    <p className="text-sm">
                                        {formValues.contactMethod
                                            ? contactMethods[formValues.contactMethod as keyof typeof contactMethods]
                                            : t('notAvailable')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>

            <div className="rounded-lg bg-green-50 p-4 flex items-start space-x-3 mt-6">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-sm font-medium text-green-800">
                        {isEditMode ? t('readyToSaveChanges') : t('readyToListBike')}
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                        {t('clickThe')} "{isEditMode ? t('saveChanges') : t('listBikeForSale')}" {t('buttonToComplete')}
                        {isEditMode ? t('changesAppliedImmediately') : t('bikeVisibleImmediately')}
                    </p>
                </div>
            </div>
        </>
    )
}

export default ReviewStep
