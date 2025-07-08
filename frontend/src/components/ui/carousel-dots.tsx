import * as React from "react"
import { cn } from "@/lib/utils"
import { type CarouselApi } from "./carousel"

interface CarouselDotsProps {
  api?: CarouselApi
  className?: string
  dotClassName?: string
}

const CarouselDots = React.forwardRef<
  HTMLDivElement,
  CarouselDotsProps
>(({ api, className, dotClassName, ...props }, ref) => {
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    const updateScrollSnaps = () => {
      setScrollSnaps(api.scrollSnapList())
    }

    const updateSelectedIndex = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }

    updateScrollSnaps()
    updateSelectedIndex()

    api.on("reInit", updateScrollSnaps)
    api.on("select", updateSelectedIndex)

    return () => {
      api.off("reInit", updateScrollSnaps)
      api.off("select", updateSelectedIndex)
    }
  }, [api])

  const scrollTo = React.useCallback(
    (index: number) => {
      if (!api) return
      api.scrollTo(index)
    },
    [api]
  )

  if (scrollSnaps.length <= 1) return null

  return (
    <div
      ref={ref}
      className={cn(
        "flex justify-center items-center gap-2 mt-4",
        className
      )}
      {...props}
    >
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-200 ease-in-out",
            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
            selectedIndex === index
              ? "bg-blue-600 w-6"
              : "bg-gray-300 hover:bg-gray-400",
            dotClassName
          )}
          onClick={() => scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={selectedIndex === index ? "true" : "false"}
        />
      ))}
    </div>
  )
})

CarouselDots.displayName = "CarouselDots"

export { CarouselDots }