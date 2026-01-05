"use client"

import { useState } from "react"
import Image from "next/image"
import { Package, ZoomIn } from "lucide-react"

interface ProductHeroSectionProps {
  images: string[]
  productTitle: string
}

export default function ProductHeroSection({ images, productTitle }: ProductHeroSectionProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [showZoom, setShowZoom] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-white rounded-xl overflow-hidden relative flex items-center justify-center border">
        <Package className="w-24 h-24 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnail Gallery - Left side */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 flex-shrink-0" style={{ width: '100px' }}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              onMouseEnter={() => setSelectedImage(index)}
              className={`rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                  ? "border-blue-600 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
                }`}
              style={{ width: '100px', height: '100px' }}
            >
              <Image
                src={image}
                alt={`${productTitle} thumbnail ${index + 1}`}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div
        className={`flex-1 aspect-[1/1] bg-white rounded-xl overflow-hidden relative border group ${images.length > 1 ? 'max-w-lg' : 'max-w-2xl'}`}
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="w-full h-full relative overflow-hidden">
          <Image
            src={images[selectedImage]}
            alt={`${productTitle} - Image ${selectedImage + 1}`}
            fill
            className="object-cover"
            priority
            style={{
              transform: showZoom ? 'scale(2)' : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              transition: showZoom ? 'none' : 'transform 0.3s ease-out'
            }}
          />
        </div>
        {!showZoom && (
          <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
            Hover to zoom
          </div>
        )}
      </div>
    </div>
  )
}

