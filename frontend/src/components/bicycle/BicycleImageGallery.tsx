import React, { useState, useEffect } from 'react' // Added useEffect
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    type CarouselApi, // Import CarouselApi type
} from '@/components/ui/carousel'

interface BicycleImageGalleryProps {
    images: string[]
    title: string
}

const BicycleImageGallery = ({ images, title }: BicycleImageGalleryProps) => {
    const [mainCarouselApi, setMainCarouselApi] = useState<CarouselApi>()
    const [thumbCarouselApi, setThumbCarouselApi] = useState<CarouselApi>()
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
        if (!mainCarouselApi || !thumbCarouselApi) {
            return
        }

        const onSelect = () => {
            setSelectedIndex(mainCarouselApi.selectedScrollSnap())
            thumbCarouselApi.scrollTo(mainCarouselApi.selectedScrollSnap())
        }

        const onThumbClick = (index: number) => {
            mainCarouselApi.scrollTo(index)
        }

        mainCarouselApi.on('select', onSelect)
        // For thumb clicks, we'll handle it directly on the button's onClick

        // Clean up listener
        return () => {
            mainCarouselApi.off('select', onSelect)
        }
    }, [mainCarouselApi, thumbCarouselApi])

    if (!images || images.length === 0) {
        return (
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
            </div>
        )
    }

    return (
        <div>
            {/* Main Image Carousel */}
            <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                <Carousel setApi={setMainCarouselApi} className="w-full">
                    <CarouselContent>
                        {images.map((image, index) => (
                            <CarouselItem key={`main-${index}`}>
                                <img
                                    src={image}
                                    alt={`${title} - Image ${index + 1}`}
                                    className="object-cover w-full h-full"
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {images.length > 1 && (
                        <>
                            <CarouselPrevious className="left-2 bg-white/50 hover:bg-white/80 text-gray-800" />
                            <CarouselNext className="right-2 bg-white/50 hover:bg-white/80 text-gray-800" />
                        </>
                    )}
                </Carousel>
            </div>

            {/* Thumbnail Navigation Carousel */}
            {images.length > 1 && (
                <Carousel
                    setApi={setThumbCarouselApi}
                    opts={{
                        align: 'start',
                        containScroll: 'keepSnaps',
                        dragFree: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2">
                        {images.map((image, index) => (
                            <CarouselItem key={`thumb-${index}`} className="pl-2 basis-1/4 md:basis-1/5 lg:basis-1/6">
                                <button
                                    className={`block aspect-square rounded-md overflow-hidden border-2 w-full
                    ${
                        selectedIndex === index
                            ? 'border-marketplace-blue ring-2 ring-marketplace-blue ring-offset-1'
                            : 'border-gray-200 hover:border-gray-400'
                    }`}
                                    onClick={() => mainCarouselApi?.scrollTo(index)}
                                >
                                    <img
                                        src={image}
                                        alt={`${title} - Thumbnail ${index + 1}`}
                                        className="object-cover w-full h-full"
                                    />
                                </button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            )}
        </div>
    )
}

export default BicycleImageGallery
