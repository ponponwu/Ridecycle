import React, { useState, useEffect, useRef } from 'react'
import { UseFormReturn, useWatch } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Upload, X } from 'lucide-react'
import { EditBikeFormValues } from '@/pages/EditBike'
import { useTranslation } from 'react-i18next'
import { BicycleCondition } from '@/types/bicycle.types'
import { getTranslatedConditionOptions } from '@/constants/conditions'

export interface PhotosStepProps {
    form: UseFormReturn<EditBikeFormValues>
    isEditMode?: boolean
    existingPhotos?: { id: string; url: string }[]
}

interface PreviewItem {
    id: string
    url: string
    file?: File
}

const PhotosStep = ({ form, isEditMode = false, existingPhotos = [] }: PhotosStepProps) => {
    const { t } = useTranslation()
    const [previewItems, setPreviewItems] = useState<Array<PreviewItem>>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Watch relevant form fields using EditBikeFormValues
    const watchedPhotos = useWatch<EditBikeFormValues, 'photos'>({ control: form.control, name: 'photos' })
    const watchedExistingPhotos = useWatch<EditBikeFormValues, 'existingPhotos'>({
        control: form.control,
        name: 'existingPhotos',
    })
    const watchedPhotosToDelete = useWatch<EditBikeFormValues, 'photosToDelete'>({
        control: form.control,
        name: 'photosToDelete',
    })

    const translatedConditionOptions = getTranslatedConditionOptions(t)

    useEffect(() => {
        const newPreviewItems: Array<PreviewItem> = []
        const currentPhotosToDelete = watchedPhotosToDelete || []

        if (isEditMode && watchedExistingPhotos && watchedExistingPhotos.length > 0) {
            watchedExistingPhotos.forEach((photo) => {
                if (!currentPhotosToDelete.includes(photo.id)) {
                    newPreviewItems.push({ id: photo.id, url: photo.url })
                }
            })
        } else if (isEditMode && existingPhotos && existingPhotos.length > 0) {
            existingPhotos.forEach((photo) => {
                if (!currentPhotosToDelete.includes(photo.id)) {
                    newPreviewItems.push({ id: photo.id, url: photo.url })
                }
            })
        }

        if (watchedPhotos && Array.isArray(watchedPhotos)) {
            watchedPhotos.forEach((file) => {
                if (file instanceof File) {
                    const tempId = `new-${file.name}-${file.lastModified}`
                    // Check if we already have this file in our preview items
                    const existingPreviewItem = previewItems.find(item => item.id === tempId)
                    
                    if (existingPreviewItem) {
                        // Reuse the existing blob URL instead of creating a new one
                        newPreviewItems.push(existingPreviewItem)
                    } else if (!newPreviewItems.some((item) => item.id === tempId)) {
                        // Only create a new blob URL if we don't already have this file
                        newPreviewItems.push({ id: tempId, url: URL.createObjectURL(file), file: file })
                    }
                }
            })
        }

        const urlsToRevoke: string[] = []
        previewItems.forEach((item) => {
            if (item.url.startsWith('blob:') && !newPreviewItems.some((newItem) => newItem.id === item.id)) {
                urlsToRevoke.push(item.url)
            }
        })
        setPreviewItems(newPreviewItems)
        urlsToRevoke.forEach(URL.revokeObjectURL)
    }, [watchedPhotos, watchedExistingPhotos, isEditMode, existingPhotos, watchedPhotosToDelete, previewItems])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        const currentNewPhotosArray = Array.isArray(form.getValues('photos'))
            ? (form.getValues('photos') as File[])
            : []
        const newUploadedFiles = Array.from(files)
        form.setValue('photos', [...currentNewPhotosArray, ...newUploadedFiles], { shouldValidate: true })
    }

    const handleRemovePhoto = (idToRemove: string, isNewFileFromPreview: boolean) => {
        if (!isNewFileFromPreview) {
            // This means it's an existing photo (id is original photo id)
            const currentPhotosToDelete = (form.getValues('photosToDelete') as string[] | undefined) || []
            if (!currentPhotosToDelete.includes(idToRemove)) {
                form.setValue('photosToDelete', [...currentPhotosToDelete, idToRemove], { shouldValidate: true })
            }
        } else {
            // This means it's a newly uploaded photo (id is tempId like `new-${file.name}`)
            const currentNewPhotos = (form.getValues('photos') as File[] | undefined) || []
            const updatedNewPhotos = currentNewPhotos.filter((file) => {
                const tempId = `new-${file.name}-${file.lastModified}`
                return tempId !== idToRemove
            })
            form.setValue('photos', updatedNewPhotos, { shouldValidate: true })
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">{t('photosAndCondition')}</h2>
                <p className="text-sm text-gray-500">
                    {isEditMode ? t('managePhotosAndCondition') : t('uploadPhotosAndCondition')}
                </p>
            </div>

            <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('photosUpTo10')}</FormLabel>
                        <FormControl>
                            <div className="space-y-4">
                                <Card className="border-dashed">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                                            <Upload className="h-8 w-8 text-gray-400" />
                                            <span className="text-sm font-medium">{t('clickToUploadPhotos')}</span>
                                            <span className="text-xs text-gray-500">{t('photoFormatsAndSize')}</span>
                                            <Button
                                                variant="outline"
                                                type="button"
                                                disabled={(previewItems?.length || 0) >= 10}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                {t('browseFiles')}
                                            </Button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleFileChange}
                                                disabled={(previewItems?.length || 0) >= 10}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {previewItems && previewItems.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {previewItems.map((item, index) => (
                                            <div key={item.id} className="relative group">
                                                <div className="aspect-square rounded-md overflow-hidden border bg-gray-50">
                                                    <img
                                                        src={item.url}
                                                        alt={`${t('bikePhoto')} ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemovePhoto(item.id, item.url.startsWith('blob:'))
                                                    }
                                                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md">
                                                        {t('mainPhoto')}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('condition')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value as BicycleCondition | undefined}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectCondition')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {translatedConditionOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}

export default PhotosStep
