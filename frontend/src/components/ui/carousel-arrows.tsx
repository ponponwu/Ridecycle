import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { type CarouselApi } from "./carousel"

interface CarouselArrowsProps {
  api?: CarouselApi
  className?: string
  buttonClassName?: string
  variant?: "inside" | "outside" | "floating"
  size?: "sm" | "md" | "lg"
}

const CarouselArrows = React.forwardRef<
  HTMLDivElement,
  CarouselArrowsProps
>(({ 
  api, 
  className, 
  buttonClassName, 
  variant = "outside", 
  size = "md",
  ...props 
}, ref) => {
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  React.useEffect(() => {
    if (!api) return

    const updateCanScroll = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    updateCanScroll()
    api.on("select", updateCanScroll)
    api.on("reInit", updateCanScroll)

    return () => {
      api.off("select", updateCanScroll)
      api.off("reInit", updateCanScroll)
    }
  }, [api])

  const scrollPrev = React.useCallback(() => {
    if (!api) return
    api.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    if (!api) return
    api.scrollNext()
  }, [api])

  // Size configurations
  const sizeConfig = {
    sm: { buttonSize: "h-8 w-8", iconSize: "h-3 w-3", offset: "8" },
    md: { buttonSize: "h-10 w-10", iconSize: "h-4 w-4", offset: "12" },
    lg: { buttonSize: "h-12 w-12", iconSize: "h-5 w-5", offset: "16" }
  }

  const config = sizeConfig[size]

  // Variant styles
  const getVariantStyles = (isLeft: boolean) => {
    switch (variant) {
      case "inside":
        return cn(
          "absolute top-1/2 -translate-y-1/2 z-10",
          "bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white/95",
          "border border-gray-200/50",
          isLeft ? "left-4" : "right-4"
        )
      case "floating":
        return cn(
          "absolute top-1/2 -translate-y-1/2 z-10",
          "bg-black/20 hover:bg-black/40 text-white border-0",
          "backdrop-blur-sm",
          isLeft ? `left-${config.offset}` : `right-${config.offset}`
        )
      default: // outside
        return cn(
          "absolute top-1/2 -translate-y-1/2",
          "bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400",
          "shadow-sm hover:shadow-md",
          isLeft ? `-left-${config.offset}` : `-right-${config.offset}`
        )
    }
  }

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          config.buttonSize,
          "rounded-full transition-all duration-200",
          getVariantStyles(true),
          !canScrollPrev && "opacity-50 cursor-not-allowed",
          buttonClassName
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft className={config.iconSize} />
      </Button>

      {/* Next Button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          config.buttonSize,
          "rounded-full transition-all duration-200",
          getVariantStyles(false),
          !canScrollNext && "opacity-50 cursor-not-allowed",
          buttonClassName
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        aria-label="Next slide"
      >
        <ChevronRight className={config.iconSize} />
      </Button>
    </div>
  )
})

CarouselArrows.displayName = "CarouselArrows"

export { CarouselArrows }