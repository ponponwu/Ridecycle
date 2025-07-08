import React, { useRef, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface HorizontalScrollContainerProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  itemClassName?: string
  gap?: number
  enableDrag?: boolean
  showScrollbar?: boolean
  itemsToShow?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

const HorizontalScrollContainer = ({
  children,
  className,
  containerClassName,
  itemClassName,
  gap = 16,
  enableDrag = true,
  showScrollbar = false,
  itemsToShow = { mobile: 1.2, tablet: 2.5, desktop: 4.5 }
}: HorizontalScrollContainerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragStarted, setDragStarted] = useState(false)

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enableDrag || !scrollRef.current) return
    
    setIsDragging(true)
    setDragStarted(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
    
    // Prevent text selection during drag
    e.preventDefault()
  }, [enableDrag])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // Scroll speed multiplier
    
    if (Math.abs(walk) > 5) {
      setDragStarted(true)
    }
    
    scrollRef.current.scrollLeft = scrollLeft - walk
    e.preventDefault()
  }, [isDragging, startX, scrollLeft])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStarted(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    setDragStarted(false)
  }, [])

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableDrag || !scrollRef.current) return
    
    const touch = e.touches[0]
    setStartX(touch.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
    setDragStarted(false)
  }, [enableDrag])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return
    
    const touch = e.touches[0]
    const x = touch.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.2
    
    if (Math.abs(walk) > 5) {
      setDragStarted(true)
    }
    
    scrollRef.current.scrollLeft = scrollLeft - walk
  }, [startX, scrollLeft])

  // Prevent click events during drag
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (dragStarted) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [dragStarted])

  // Calculate item width based on container width and items to show
  const getItemWidth = () => {
    if (!scrollRef.current) return 'auto'
    
    const containerWidth = scrollRef.current.offsetWidth
    const effectiveWidth = containerWidth - (gap * (itemsToShow.desktop - 1))
    
    return `${effectiveWidth / itemsToShow.desktop}px`
  }

  // Add global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollRef.current) return
      
      const x = e.pageX - scrollRef.current.offsetLeft
      const walk = (x - startX) * 1.5
      
      if (Math.abs(walk) > 5) {
        setDragStarted(true)
      }
      
      scrollRef.current.scrollLeft = scrollLeft - walk
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setDragStarted(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, startX, scrollLeft])

  const childrenArray = React.Children.toArray(children)

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto overflow-y-hidden",
          "scrollbar-thin scrollbar-track-transparent",
          !showScrollbar && "scrollbar-hide",
          isDragging && "cursor-grabbing select-none",
          !isDragging && enableDrag && "cursor-grab",
          "scroll-smooth",
          containerClassName
        )}
        style={{
          gap: `${gap}px`,
          scrollSnapType: 'x mandatory',
          scrollbarWidth: showScrollbar ? 'thin' : 'none',
          msOverflowStyle: showScrollbar ? 'auto' : 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={handleClick}
      >
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className={cn(
              "flex-shrink-0",
              // Responsive width classes
              "w-[280px] sm:w-[300px] md:w-[280px] lg:w-[260px]",
              itemClassName
            )}
            style={{
              scrollSnapAlign: 'start'
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default HorizontalScrollContainer