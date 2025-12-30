"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, GripVertical, Upload, Loader2, Image as ImageIcon } from "lucide-react"
import type { BannerSlide } from "@/lib/types/banners"
import { uploadSlideImage } from "@/lib/actions/banner-slides"
import { toast } from "sonner"
import Image from "next/image"

interface BannerSlideManagerProps {
    slides: BannerSlide[]
    onSlidesChange: (slides: BannerSlide[]) => void
    isEditing?: boolean
}

interface SlideFormData {
    id: string
    image_url: string
    mobile_image_url?: string
    image_alt?: string
    sort_order: number
    file?: File
    mobileFile?: File
    isUploading?: boolean
}

export function BannerSlideManager({ slides, onSlidesChange, isEditing = false }: BannerSlideManagerProps) {
    const [slidesForms, setSlidesForms] = useState<SlideFormData[]>([])
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    // Load existing slides on mount
    useEffect(() => {
        if (slides.length > 0 && slidesForms.length === 0) {
            setSlidesForms(slides.map(s => ({
                id: s.id,
                image_url: s.image_url,
                mobile_image_url: s.mobile_image_url || undefined,
                image_alt: s.image_alt || undefined,
                sort_order: s.sort_order
            })))
        }
    }, [slides, slidesForms.length])

    const handleAddSlide = () => {
        const newSlide: SlideFormData = {
            id: `temp-${Date.now()}`,
            image_url: "",
            sort_order: slidesForms.length,
            isUploading: false
        }
        setSlidesForms([...slidesForms, newSlide])
    }

    const handleRemoveSlide = (index: number) => {
        const updated = slidesForms.filter((_, i) => i !== index)
        setSlidesForms(updated)
        updateParent(updated)
    }

    const handleImageChange = async (index: number, file: File) => {
        // File size validation (5MB max)
        const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
            const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)
            toast.error(`File size (${sizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB. Please upload a smaller image.`)
            return
        }

        const updated = [...slidesForms]
        updated[index].isUploading = true
        setSlidesForms(updated)

        try {
            const result = await uploadSlideImage(file)
            if (result.success && result.url) {
                updated[index].image_url = result.url
                // Use the same image for mobile (responsive display)
                updated[index].mobile_image_url = result.url
                updated[index].isUploading = false
                setSlidesForms(updated)
                updateParent(updated)
                toast.success('Image uploaded successfully')
            } else {
                toast.error(result.error || 'Failed to upload image')
                updated[index].isUploading = false
                setSlidesForms(updated)
            }
        } catch (error) {
            toast.error('Failed to upload image')
            updated[index].isUploading = false
            setSlidesForms(updated)
        }
    }

    const handleAltChange = (index: number, alt: string) => {
        const updated = [...slidesForms]
        updated[index].image_alt = alt
        setSlidesForms(updated)
        updateParent(updated)
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        const updated = [...slidesForms]
        const draggedItem = updated[draggedIndex]
        updated.splice(draggedIndex, 1)
        updated.splice(index, 0, draggedItem)

        // Update sort_order
        updated.forEach((slide, idx) => {
            slide.sort_order = idx
        })

        setSlidesForms(updated)
        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
        updateParent(slidesForms)
    }

    const updateParent = (updatedSlides: SlideFormData[]) => {
        const validSlides = updatedSlides
            .filter(s => s.image_url)
            .map((s, idx) => ({
                id: s.id,
                banner_id: "",
                image_url: s.image_url,
                mobile_image_url: s.mobile_image_url || null,
                image_alt: s.image_alt || null,
                sort_order: idx,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }))
        onSlidesChange(validSlides)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Carousel Slides</CardTitle>
                <p className="text-sm text-gray-500">
                    Add multiple images for your carousel banner (recommended: 3-5 slides)
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {slidesForms.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-3">No slides yet</p>
                        <Button onClick={handleAddSlide} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Slide
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {slidesForms.map((slide, index) => (
                            <div
                                key={slide.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`border rounded-lg p-4 ${draggedIndex === index ? 'opacity-50' : ''
                                    } bg-white hover:shadow-md transition-shadow cursor-move`}
                            >
                                <div className="flex items-start gap-4">
                                    <GripVertical className="h-5 w-5 text-gray-400 mt-2 flex-shrink-0" />

                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium">Slide {index + 1}</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveSlide(index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Slide Image */}
                                        <div className="space-y-2">
                                            <Label>Slide Image * (Max: 5MB)</Label>
                                            {slide.image_url ? (
                                                <div className="relative w-full h-40 border rounded-lg overflow-hidden group">
                                                    <Image
                                                        src={slide.image_url}
                                                        alt={slide.image_alt || `Slide ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                                                        <div className="text-center text-white">
                                                            <Upload className="h-8 w-8 mx-auto mb-2" />
                                                            <span className="text-sm">Change Image</span>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) handleImageChange(index, file)
                                                            }}
                                                            disabled={slide.isUploading}
                                                        />
                                                    </label>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-600 mb-1">Upload carousel image</span>
                                                    <span className="text-xs text-gray-400">Recommended: 1920x1080 (Max: 5MB)</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) handleImageChange(index, file)
                                                        }}
                                                        disabled={slide.isUploading}
                                                    />
                                                </label>
                                            )}
                                            {slide.isUploading && (
                                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {slidesForms.length > 0 && slidesForms.length < 10 && (
                    <Button
                        variant="outline"
                        onClick={handleAddSlide}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Slide
                    </Button>
                )}

                {slidesForms.length >= 10 && (
                    <p className="text-sm text-amber-600">
                        Maximum of 10 slides reached
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
