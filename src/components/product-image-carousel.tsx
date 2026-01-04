"use client"

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProductImageCarouselProps {
    images: string[]
    productName: string
}

export function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Filter out empty/invalid images
    const validImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '')

    if (validImages.length === 0) {
        return (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
        )
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
    }

    return (
        <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                <Image
                    src={validImages[currentIndex]}
                    alt={`${productName} - Image ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Navigation Arrows - Only show if more than 1 image */}
                {validImages.length > 1 && (
                    <>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                            onClick={goToPrevious}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                            onClick={goToNext}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>

                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {currentIndex + 1} / {validImages.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnail Navigation - Only show if more than 1 image */}
            {validImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {validImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all",
                                currentIndex === index
                                    ? "border-orange-500 ring-2 ring-orange-200"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

