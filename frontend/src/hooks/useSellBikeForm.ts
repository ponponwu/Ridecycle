import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EditBikeFormValues } from '@/pages/EditBike'
import { TFunction } from 'i18next'

// Define the schema-generating function
export const getSellBikeSchema = (t: TFunction) =>
    z
        .object({
            // Basic details
            title: z.string().min(5, { message: t('zodErrors.titleMinChar', { min: 5 }) }),
            brandId: z.string().min(1, { message: t('zodErrors.brandRequired') }),
            brandName: z.string().optional(),
            // model: z.string().min(1, { message: t('zodErrors.modelRequired') }),
            transmissionId: z.string().min(1, { message: t('zodErrors.transmissionRequired') }),
            transmissionName: z.string().optional(),
            bicycleModelId: z.string().optional(),
            bicycleModelName: z.string().optional(),
            year: z.string().min(4, { message: t('zodErrors.yearRequired') }),
            bicycleType: z.string().min(1, { message: t('zodErrors.bicycleTypeRequired') }),
            frameSize: z.string().min(1, { message: t('zodErrors.frameSizeRequired') }),
            description: z.string().min(20, { message: t('zodErrors.descriptionMinChar', { min: 20 }) }),

            // Photos and condition
            photos: z.array(z.instanceof(File), { message: t('zodErrors.photosInvalidType') }).optional(),
            existingPhotos: z.array(z.object({ id: z.string(), url: z.string() })).optional(),
            photosToDelete: z.array(z.string()).optional(),
            condition: z.string().min(1, { message: t('zodErrors.conditionRequired') }),

            // Pricing & location
            price: z.string().min(1, { message: t('zodErrors.priceRequired') }),
            location: z.string().min(1, { message: t('zodErrors.locationRequired') }),
            contactMethod: z.string().min(1, { message: t('zodErrors.contactMethodRequired') }),
        })
        .superRefine((data, ctx) => {
            const { photos, existingPhotos, photosToDelete } = data
            const newPhotosCount = photos?.length || 0
            const existingPhotosNotMarkedForDeletionCount =
                existingPhotos?.filter((ep) => !photosToDelete?.includes(ep.id))?.length || 0

            if (newPhotosCount === 0 && existingPhotosNotMarkedForDeletionCount === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('zodErrors.photosMinRequired'),
                    path: ['photos'],
                })
            }
        })

// The hook now needs to accept t or be used where t is available to create the schema
export const useSellBikeForm = (t: TFunction) => {
    const schema = getSellBikeSchema(t)
    const form = useForm<EditBikeFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            brandId: '',
            brandName: '',
            transmissionId: '',
            transmissionName: '',
            bicycleModelId: '',
            bicycleModelName: '',
            year: '',
            bicycleType: '',
            frameSize: '',
            description: '',
            photos: [],
            existingPhotos: [],
            photosToDelete: [],
            condition: '',
            price: '',
            location: '',
            contactMethod: 'app',
        },
        mode: 'onChange',
    })

    return form
}
