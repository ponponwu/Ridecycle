import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  type CarouselApi 
} from '@/components/ui/carousel'
import { CarouselDots } from '@/components/ui/carousel-dots'
import { CarouselArrows } from '@/components/ui/carousel-arrows'
import BicycleCard, { BicycleCardProps } from './BicycleCard'

interface BicycleCarouselProps {
  bicycles: BicycleCardProps[]
  title?: string
  viewAllLink?: string
  showDots?: boolean
  showArrows?: boolean
  arrowVariant?: "inside" | "outside" | "floating"
  autoPlay?: boolean
  autoPlayDelay?: number
  itemsPerView?: {
    mobile: number
    tablet: number
    desktop: number
  }
  className?: string
}

const BicycleCarousel = ({
  bicycles,
  title,
  viewAllLink,
  showDots = true,
  showArrows = true,
  arrowVariant = "outside",
  autoPlay = false,
  autoPlayDelay = 5000,
  itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  className
}: BicycleCarouselProps) => {
  const { t } = useTranslation()
  const [api, setApi] = React.useState<CarouselApi>()

  // Auto-play functionality
  React.useEffect(() => {
    if (!api || !autoPlay) return

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0) // Loop back to first slide
      }
    }, autoPlayDelay)

    return () => clearInterval(interval)
  }, [api, autoPlay, autoPlayDelay])

  // Pause auto-play on hover
  const handleMouseEnter = React.useCallback(() => {
    if (!api || !autoPlay) return
    api.off('pointerDown') // Stop auto-play
  }, [api, autoPlay])

  const handleMouseLeave = React.useCallback(() => {
    if (!api || !autoPlay) return
    // Could restart auto-play here if needed
  }, [api, autoPlay])

  if (bicycles.length === 0) {
    return null
  }

  // Calculate responsive basis classes
  const getBasisClass = () => {
    const mobile = `basis-full`
    const tablet = `sm:basis-1/${itemsPerView.tablet}`
    const desktop = `lg:basis-1/${itemsPerView.desktop}`
    return `${mobile} ${tablet} ${desktop}`
  }

  return (
    <section className={`py-8 ${className || ''}`}>
      {/* Header */}
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {viewAllLink && (
            <Link 
              to={viewAllLink} 
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium transition-colors"
            >
              {t('viewAll')}
            </Link>
          )}
        </div>
      )}

      {/* Carousel */}
      <div className="relative">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: autoPlay,
            dragFree: true,
            skipSnaps: false,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {bicycles.map((bike) => (
              <CarouselItem 
                key={bike.id} 
                className={`pl-2 md:pl-4 ${getBasisClass()}`}
              >
                <div className="h-full">
                  <BicycleCard {...bike} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Arrows */}
          {showArrows && (
            <CarouselArrows 
              api={api} 
              variant={arrowVariant}
              size="md"
              className="hidden sm:block"
            />
          )}
        </Carousel>

        {/* Dots Indicator */}
        {showDots && (
          <CarouselDots 
            api={api}
            className="mt-6"
            dotClassName="bg-emerald-300 data-[active=true]:bg-emerald-600"
          />
        )}
      </div>

      {/* Mobile Navigation Hint */}
      <div className="sm:hidden mt-4 text-center">
        <p className="text-sm text-gray-500">
          {t('swipeToNavigate', '左右滑動查看更多')}
        </p>
      </div>
    </section>
  )
}

export default BicycleCarousel