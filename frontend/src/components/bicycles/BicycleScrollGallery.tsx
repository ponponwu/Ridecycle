import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import HorizontalScrollContainer from '@/components/ui/horizontal-scroll-container'
import CompactBicycleCard from './CompactBicycleCard'
import { BicycleCardProps } from './BicycleCard'
import { Button } from '@/components/ui/button'

interface BicycleScrollGalleryProps {
  bicycles: BicycleCardProps[]
  title?: string
  viewAllLink?: string
  subtitle?: string
  className?: string
  showArrows?: boolean
  enableDrag?: boolean
  showScrollHint?: boolean
}

const BicycleScrollGallery = ({
  bicycles,
  title,
  viewAllLink,
  subtitle,
  className,
  showArrows = false, // Optional arrows for additional navigation
  enableDrag = true,
  showScrollHint = true
}: BicycleScrollGalleryProps) => {
  const { t } = useTranslation()
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Scroll functions for optional arrow buttons
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -280, // Approximate card width
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 280,
        behavior: 'smooth'
      })
    }
  }

  if (bicycles.length === 0) {
    return null
  }

  return (
    <section className={`py-6 ${className || ''}`}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 text-sm">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {viewAllLink && (
              <Link 
                to={viewAllLink} 
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm hover:underline transition-colors"
              >
                {t('viewAll')}
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
            
            {/* Optional arrow buttons */}
            {showArrows && (
              <div className="hidden sm:flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollLeft}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollRight}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scroll Container */}
      <div className="relative">
        <HorizontalScrollContainer
          enableDrag={enableDrag}
          showScrollbar={false}
          gap={16}
          itemsToShow={{
            mobile: 1.3,
            tablet: 2.5,
            desktop: 4.5
          }}
          className="pb-2"
        >
          {bicycles.map((bicycle) => (
            <CompactBicycleCard
              key={bicycle.id}
              {...bicycle}
            />
          ))}
        </HorizontalScrollContainer>

        {/* Gradient overlay for better visual indication */}
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white/80 to-transparent pointer-events-none" />
      </div>

      {/* Scroll hint for mobile */}
      {showScrollHint && (
        <div className="sm:hidden mt-3 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <span>👈</span>
            {t('swipeToSeeMore', '左右滑動查看更多商品')}
            <span>👉</span>
          </p>
        </div>
      )}

      {/* Scroll hint for desktop */}
      {showScrollHint && (
        <div className="hidden sm:block mt-3 text-center">
          <p className="text-xs text-gray-500">
            {t('dragToScroll', '拖曳滑動查看更多商品')}
          </p>
        </div>
      )}
    </section>
  )
}

export default BicycleScrollGallery