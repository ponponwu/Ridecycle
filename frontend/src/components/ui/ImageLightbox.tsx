import React, { useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageLightboxProps {
    images: string[]
    currentIndex: number
    isOpen: boolean
    onClose: () => void
    onNavigate: (index: number) => void
    title?: string
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
    images,
    currentIndex,
    isOpen,
    onClose,
    onNavigate,
    title = ''
}) => {
    const [imageLoading, setImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // 鍵盤事件處理
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!isOpen) return

        switch (event.key) {
            case 'Escape':
                onClose()
                break
            case 'ArrowLeft':
                event.preventDefault()
                if (currentIndex > 0) {
                    onNavigate(currentIndex - 1)
                }
                break
            case 'ArrowRight':
                event.preventDefault()
                if (currentIndex < images.length - 1) {
                    onNavigate(currentIndex + 1)
                }
                break
            case ' ':
                event.preventDefault()
                if (currentIndex < images.length - 1) {
                    onNavigate(currentIndex + 1)
                } else {
                    onNavigate(0) // 循環到第一張
                }
                break
        }
    }, [isOpen, currentIndex, images.length, onClose, onNavigate])

    // 註冊鍵盤事件監聽器
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden' // 防止背景滾動
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, handleKeyDown])

    // 圖片變更時重置狀態
    useEffect(() => {
        if (isOpen) {
            setImageLoading(true)
            setImageError(false)
        }
    }, [currentIndex, isOpen])

    // 背景點擊關閉
    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    // 圖片載入完成
    const handleImageLoad = () => {
        setImageLoading(false)
    }

    // 圖片載入錯誤
    const handleImageError = () => {
        setImageLoading(false)
        setImageError(true)
    }

    // 導航函數
    const goToPrevious = () => {
        if (currentIndex > 0) {
            onNavigate(currentIndex - 1)
        }
    }

    const goToNext = () => {
        if (currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1)
        }
    }

    // 觸控事件處理
    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null) // Reset touch end
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe && currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1)
        }
        
        if (isRightSwipe && currentIndex > 0) {
            onNavigate(currentIndex - 1)
        }
    }

    if (!isOpen) return null

    const lightboxContent = (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={handleBackgroundClick}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* 關閉按鈕 */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full h-8 w-8 md:h-10 md:w-10"
                onClick={onClose}
            >
                <X className="h-4 w-4 md:h-6 md:w-6" />
            </Button>

            {/* 圖片計數器 */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-black/50 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                {currentIndex + 1} / {images.length}
            </div>

            {/* 上一張按鈕 */}
            {images.length > 1 && currentIndex > 0 && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10 md:h-12 md:w-12"
                    onClick={goToPrevious}
                >
                    <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
            )}

            {/* 下一張按鈕 */}
            {images.length > 1 && currentIndex < images.length - 1 && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10 md:h-12 md:w-12"
                    onClick={goToNext}
                >
                    <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
            )}

            {/* 主圖片容器 */}
            <div className="relative max-w-[90vw] max-h-[85vh] md:max-w-[95vw] md:max-h-[95vh] flex items-center justify-center px-4 md:px-0">
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {imageError ? (
                    <div className="flex flex-col items-center justify-center text-white p-4 md:p-8">
                        <X className="h-12 w-12 md:h-16 md:w-16 mb-2 md:mb-4 opacity-50" />
                        <p className="text-sm md:text-lg">無法載入圖片</p>
                    </div>
                ) : (
                    <img
                        src={images[currentIndex]}
                        alt={`${title} - 圖片 ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{ display: imageLoading ? 'none' : 'block' }}
                    />
                )}
            </div>

            {/* 圖片標題 */}
            {title && (
                <div className="absolute bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm max-w-[85vw] md:max-w-[90vw] text-center">
                    {title} - 圖片 {currentIndex + 1}
                </div>
            )}

            {/* 手機端：觸控提示 */}
            <div className="absolute bottom-2 right-2 z-10 bg-black/50 text-white px-2 py-1 rounded-lg text-xs md:hidden">
                滑動切換圖片
            </div>
        </div>
    )

    // 使用 Portal 渲染到 body
    return createPortal(lightboxContent, document.body)
}

export default ImageLightbox