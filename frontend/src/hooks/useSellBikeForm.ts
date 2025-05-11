import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SellBikeFormValues } from '@/components/sell/types'

// Define the schema for the form
const sellBikeSchema = z.object({
    // Basic details
    title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
    brand: z.string().min(1, { message: 'Brand is required' }),
    model: z.string().min(1, { message: 'Model is required' }),
    year: z.string().min(4, { message: 'Valid year is required' }),
    bikeType: z.string().min(1, { message: 'Bike type is required' }),
    frameSize: z.string().min(1, { message: 'Frame size is required' }),
    description: z.string().min(20, { message: 'Please provide a detailed description (at least 20 characters)' }),

    // Photos and condition
    photos: z
        .array(z.instanceof(File), { message: 'Invalid file type' })
        .min(1, { message: 'At least one photo is required' }),
    condition: z.string().min(1, { message: 'Condition is required' }),

    // Pricing & location
    price: z.string().min(1, { message: 'Price is required' }),
    location: z.string().min(1, { message: 'Location is required' }),
    contactMethod: z.string().min(1, { message: 'Contact method is required' }),
})

export const useSellBikeForm = () => {
    const form = useForm<SellBikeFormValues>({
        resolver: zodResolver(sellBikeSchema),
        defaultValues: {
            title: '',
            brand: '',
            model: '',
            year: '',
            bikeType: '',
            frameSize: '',
            description: '',
            photos: [],
            condition: '',
            price: '',
            location: '',
            contactMethod: 'app',
        },
        mode: 'onChange',
    })

    return form
}
