import React, { useState, useEffect, useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Upload, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SellBikeFormValues } from './types'

interface PhotosStepProps {
    form: UseFormReturn<SellBikeFormValues>
}

const conditions = [
    'New - Never Used',
    'Like New - Used only a few times',
    'Excellent - Minimal wear',
    'Good - Normal wear for age',
    'Fair - Works well but shows wear',
    'Poor - Needs work',
]

const PhotosStep = ({ form }: PhotosStepProps) => {
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null) // Changed React.useRef to useRef

    // Watch for changes in the 'photos' field from react-hook-form
    const watchedPhotos = form.watch('photos')

    useEffect(() => {
        // When watchedPhotos changes (e.g., on step navigation or initial load with existing data),
        // regenerate preview URLs.
        if (watchedPhotos && Array.isArray(watchedPhotos)) {
            const currentObjectUrls = new Set<string>()
            const urls = watchedPhotos
                .map((file) => {
                    if (file instanceof File) {
                        const url = URL.createObjectURL(file)
                        currentObjectUrls.add(url)
                        return url
                    }
                    // If file is already a string URL (e.g. from server for an existing bike being edited), use it directly
                    if (typeof file === 'string') {
                        return file
                    }
                    return ''
                })
                .filter((url) => url !== '')

            // Revoke old URLs that are not in the new set of URLs and were blob URLs
            previewUrls.forEach((oldUrl) => {
                if (oldUrl.startsWith('blob:') && !currentObjectUrls.has(oldUrl)) {
                    URL.revokeObjectURL(oldUrl)
                }
            })
            setPreviewUrls(urls)
        } else {
            // If there are no photos, clear the preview URLs and revoke any existing blob URLs.
            previewUrls.forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url)
                }
            })
            setPreviewUrls([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedPhotos]) // Rerun effect when watchedPhotos array reference changes
    // Note: previewUrls is intentionally omitted from deps to avoid re-running when it's set inside this effect.
    // This is a common pattern but be mindful of potential stale closures if logic becomes more complex.

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        const newPhotos = [...form.getValues('photos')]
        const newUrls = [...previewUrls]

        Array.from(files).forEach((file) => {
            newPhotos.push(file)
            newUrls.push(URL.createObjectURL(file))
        })

        form.setValue('photos', newPhotos, { shouldValidate: true })
        setPreviewUrls(newUrls)
    }

    const removePhoto = (index: number) => {
        const newPhotos = [...form.getValues('photos')]
        const newUrls = [...previewUrls]

        newPhotos.splice(index, 1)
        newUrls.splice(index, 1)

        form.setValue('photos', newPhotos, { shouldValidate: true })
        setPreviewUrls(newUrls)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Photos & Condition</h2>
                <p className="text-sm text-gray-500">Upload photos of your bike and describe its condition.</p>
            </div>

            <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Photos (up to 10)</FormLabel>
                        <FormControl>
                            <div className="space-y-4">
                                <Card className="border-dashed">
                                    <CardContent className="p-6">
                                        <label className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                                            <Upload className="h-8 w-8 text-gray-400" />
                                            <span className="text-sm font-medium">
                                                Drop files here or click to upload
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Include multiple angles of your bike. First photo will be the main
                                                image.
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                                disabled={previewUrls.length >= 10}
                                                ref={fileInputRef}
                                            />
                                            <Button
                                                variant="outline"
                                                type="button"
                                                disabled={previewUrls.length >= 10}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Browse Files
                                            </Button>
                                        </label>
                                    </CardContent>
                                </Card>

                                {previewUrls.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-md overflow-hidden border bg-gray-50">
                                                    <img
                                                        src={url}
                                                        alt={`Bike photo ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md">
                                                        Main photo
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
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {conditions.map((condition) => (
                                    <SelectItem key={condition} value={condition}>
                                        {condition}
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
