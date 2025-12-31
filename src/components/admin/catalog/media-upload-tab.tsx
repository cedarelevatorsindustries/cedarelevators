"use client"

import { useState, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaUploadTabProps {
    // Thumbnail
    thumbnailUrl?: string
    onThumbnailChange: (file: File | null, preview: string) => void
    thumbnailAlt?: string
    onThumbnailAltChange?: (alt: string) => void

    // Banner
    showBanner?: boolean
    bannerUrl?: string
    onBannerChange?: (file: File | null, preview: string) => void
    bannerAlt?: string
    onBannerAltChange?: (alt: string) => void

    className?: string
}

export function MediaUploadTab({
    thumbnailUrl,
    onThumbnailChange,
    thumbnailAlt,
    onThumbnailAltChange,
    showBanner = true,
    bannerUrl,
    onBannerChange,
    bannerAlt,
    onBannerAltChange,
    className
}: MediaUploadTabProps) {
    const [thumbnailPreview, setThumbnailPreview] = useState(thumbnailUrl || "")
    const [bannerPreview, setBannerPreview] = useState(bannerUrl || "")

    const handleThumbnailUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const preview = reader.result as string
                setThumbnailPreview(preview)
                onThumbnailChange(file, preview)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const preview = reader.result as string
                setBannerPreview(preview)
                onBannerChange?.(file, preview)
            }
            reader.readAsDataURL(file)
        }
    }

    const clearThumbnail = () => {
        setThumbnailPreview("")
        onThumbnailChange(null, "")
    }

    const clearBanner = () => {
        setBannerPreview("")
        onBannerChange?.(null, "")
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Thumbnail Upload */}
            <Card>
                <CardHeader>
                    <CardTitle>Thumbnail Image</CardTitle>
                    <CardDescription>
                        Used in listings and cards. Recommended aspect ratio: 1:1 (square)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-6">
                        {/* Upload Area */}
                        <div
                            onClick={() => document.getElementById('thumbnail-upload')?.click()}
                            className={cn(
                                "h-40 w-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden",
                                thumbnailPreview
                                    ? "border-solid border-gray-200"
                                    : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                            )}
                        >
                            {thumbnailPreview ? (
                                <>
                                    <img
                                        src={thumbnailPreview}
                                        className="w-full h-full object-cover"
                                        alt="Thumbnail preview"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="text-white text-center">
                                            <Upload className="h-6 w-6 mx-auto mb-1" />
                                            <span className="text-xs font-medium">Change</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            clearThumbnail()
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500 font-medium">Upload Image</span>
                                    <span className="text-xs text-gray-400 mt-1">1:1 ratio</span>
                                </>
                            )}
                        </div>

                        {/* Alt Text */}
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="thumbnail-alt">Alt Text</Label>
                            <Input
                                id="thumbnail-alt"
                                placeholder="Describe image for accessibility"
                                value={thumbnailAlt || ""}
                                onChange={(e) => onThumbnailAltChange?.(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                                JPG, PNG or WEBP. Max 2MB. Recommended: 800x800px
                            </p>
                        </div>

                        <input
                            id="thumbnail-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Banner Upload */}
            {showBanner && (
                <Card>
                    <CardHeader>
                        <CardTitle>Banner Image</CardTitle>
                        <CardDescription>
                            Used on detail pages and landing sections. Recommended aspect ratio: 16:9 (landscape)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            {/* Upload Area */}
                            <div
                                onClick={() => document.getElementById('banner-upload')?.click()}
                                className={cn(
                                    "h-48 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden",
                                    bannerPreview
                                        ? "border-solid border-gray-200"
                                        : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                                )}
                            >
                                {bannerPreview ? (
                                    <>
                                        <img
                                            src={bannerPreview}
                                            className="w-full h-full object-cover"
                                            alt="Banner preview"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="text-white text-center">
                                                <Upload className="h-6 w-6 mx-auto mb-1" />
                                                <span className="text-xs font-medium">Change</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                clearBanner()
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500 font-medium">Upload Banner</span>
                                        <span className="text-xs text-gray-400 mt-1">16:9 ratio</span>
                                    </>
                                )}
                            </div>

                            {/* Alt Text */}
                            <div className="space-y-2">
                                <Label htmlFor="banner-alt">Banner Alt Text</Label>
                                <Input
                                    id="banner-alt"
                                    placeholder="Describe banner for accessibility"
                                    value={bannerAlt || ""}
                                    onChange={(e) => onBannerAltChange?.(e.target.value)}
                                />
                                <p className="text-xs text-gray-500">
                                    JPG, PNG or WEBP. Max 2MB. Recommended: 1920x1080px
                                </p>
                            </div>

                            <input
                                id="banner-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleBannerUpload}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
