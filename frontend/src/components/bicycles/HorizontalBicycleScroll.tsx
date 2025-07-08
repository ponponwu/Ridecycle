import React from 'react'
import BicycleCarousel from './BicycleCarousel'
import { BicycleCardProps } from './BicycleCard'

interface HorizontalBicycleScrollProps {
    bicycles: BicycleCardProps[]
    title?: string
    viewAllLink?: string
}

const HorizontalBicycleScroll = ({ bicycles, title, viewAllLink }: HorizontalBicycleScrollProps) => {
    return (
        <BicycleCarousel
            bicycles={bicycles}
            title={title}
            viewAllLink={viewAllLink}
            showDots={true}
            showArrows={true}
            arrowVariant="outside"
            autoPlay={false}
            itemsPerView={{
                mobile: 1,
                tablet: 2,
                desktop: 3
            }}
        />
    )
}

export default HorizontalBicycleScroll