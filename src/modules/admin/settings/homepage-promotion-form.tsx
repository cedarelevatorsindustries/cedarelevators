"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { 
  Sparkles, 
  Upload, 
  X, 
  LoaderCircle, 
  Save, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ArrowRight
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

import { getStoreSettings, updateStoreSettings } from "@/lib/services/settings"
import { HomepagePromotion, StoreSettings } from "@/lib/types/settings"

export function HomepagePromotionForm() {
  const [isFetching, setIsFetching] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  // Promotion Form State
  const [enabled, setEnabled] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [ctaLabel, setCtaLabel] = useState("Explore Products →")
  const [ctaUrl, setCtaUrl] = useState("/products")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsFetching(true)
    try {
      const result = await getStoreSettings()
      if (result.success && result.data) {
        setSettings(result.data)
        const promo = result.data.homepage_promotion
        if (promo) {
          setEnabled(Boolean(promo.enabled))
          setTitle(promo.title || "")
          setDescription(promo.description || "")
          setImageUrl(promo.image_url || "")
          setCtaLabel(promo.cta_label || "Explore Products →")
          setCtaUrl(promo.cta_url || "/products")
          setStartDate(promo.start_date ? promo.start_date.substring(0, 16) : "")
          setEndDate(promo.end_date ? promo.end_date.substring(0, 16) : "")
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings for homepage promotion:", error)
      toast.error("Failed to load promotion settings")
    } finally {
      setIsFetching(false)
    }
  }

  // Handle Image Upload to Cloudinary via existing /api/upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, and WebP are supported.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large. Maximum size is 10MB.")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "homepage-promotions")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.url) {
        setImageUrl(data.url)
        toast.success("Promotional image uploaded successfully")
      } else {
        toast.error(data.error || "Failed to upload promotional image")
      }
    } catch (error) {
      console.error("Error uploading promotion image:", error)
      toast.error("Upload failed. Please check network connection.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!settings) {
      toast.error("Store settings not loaded")
      return
    }

    // Validation when enabled
    if (enabled && !title.trim()) {
      toast.error("A promotional headline (title) is required when enabled")
      return
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) {
        toast.error("End date must be after start date")
        return
      }
    }

    setIsSaving(true)
    try {
      const promoData: HomepagePromotion = {
        enabled,
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || null,
        cta_label: ctaLabel.trim() || "Explore Products →",
        cta_url: ctaUrl.trim() || "/products",
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
      }

      const result = await updateStoreSettings(settings.id, {
        homepage_promotion: promoData,
      })

      if (result.success) {
        toast.success("Homepage promotion saved successfully")
        if (result.data) {
          setSettings(result.data)
        }
      } else {
        toast.error(result.error || "Failed to save promotion")
      }
    } catch (error: any) {
      console.error("Error saving homepage promotion:", error)
      toast.error(error.message || "Failed to save promotion")
    } finally {
      setIsSaving(false)
    }
  }

  // Compute status for badge
  const getPromotionStatus = () => {
    if (!enabled) return { label: "Disabled", variant: "secondary" as const }
    if (!title.trim()) return { label: "Draft (No Title)", variant: "destructive" as const }

    const now = new Date()
    if (startDate && now < new Date(startDate)) {
      return { label: "Scheduled", variant: "outline" as const }
    }
    if (endDate && now > new Date(endDate)) {
      return { label: "Expired", variant: "destructive" as const }
    }
    return { label: "Live on Homepage", variant: "default" as const }
  }

  const status = getPromotionStatus()

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Configuration Card */}
      <Card className="border border-gray-200 shadow-xs">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-xl font-bold text-gray-900">
                  Homepage Promotion
                </CardTitle>
                <Badge variant={status.variant} className="ml-1">
                  {status.label}
                </Badge>
              </div>
              <CardDescription className="text-gray-500 mt-1 text-sm">
                Control the optional promotional banner shown directly below the permanent homepage hero.
              </CardDescription>
            </div>

            <Button
              onClick={() => handleSubmit()}
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white min-w-[130px]"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* 1. Master Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50/50 border border-orange-100">
            <div className="space-y-0.5">
              <Label htmlFor="promo-enable" className="text-base font-semibold text-gray-900 cursor-pointer">
                Enable Homepage Promotional Banner
              </Label>
              <p className="text-xs sm:text-sm text-gray-500">
                When turned off, no banner or empty space will appear on the homepage.
              </p>
            </div>
            <Switch
              id="promo-enable"
              checked={enabled}
              onCheckedChange={setEnabled}
              className="data-[state=checked]:bg-orange-600"
            />
          </div>

          {/* 2. Text Content */}
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <Label htmlFor="promo-title" className="text-sm font-medium text-gray-900">
                Promotional Headline *
              </Label>
              <Input
                id="promo-title"
                placeholder="e.g. Explore Our Latest Product Offers"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-gray-500">
                A concise, impactful headline for special offers, arrivals, or updates.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-description" className="text-sm font-medium text-gray-900">
                Supporting Description
              </Label>
              <Textarea
                id="promo-description"
                placeholder="e.g. Discover selected elevator components and engineering solutions for your next project."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Short supplementary copy explaining the promotion (1-2 sentences).
              </p>
            </div>
          </div>

          {/* 3. Call to Action (CTA) Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            <div className="space-y-2">
              <Label htmlFor="promo-cta-label" className="text-sm font-medium text-gray-900">
                Button Text (CTA Label)
              </Label>
              <Input
                id="promo-cta-label"
                placeholder="Explore Products →"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-cta-url" className="text-sm font-medium text-gray-900">
                Button Destination URL (CTA URL)
              </Label>
              <Input
                id="promo-cta-url"
                placeholder="/products"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
              />
            </div>
          </div>

          {/* 4. Optional Image Upload */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <Label className="text-sm font-medium text-gray-900">
              Optional Promotional Image
            </Label>
            <p className="text-xs text-gray-500">
              Optional image (16:9 or 4:3 recommended, max 10MB). Text-only banners look equally clean and minimal if no image is uploaded.
            </p>

            {imageUrl ? (
              <div className="relative inline-block border border-gray-200 rounded-lg p-2 bg-gray-50">
                <div className="relative w-64 h-36 rounded-md overflow-hidden bg-white">
                  <Image
                    src={imageUrl}
                    alt="Promotion preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="promo-image-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-600"
                >
                  {isUploading ? (
                    <>
                      <LoaderCircle className="w-4 h-4 mr-2 animate-spin text-orange-600" />
                      Uploading to Cloudinary...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
                <span className="text-xs text-gray-400">or paste direct image URL below</span>
              </div>
            )}

            {!imageUrl && (
              <Input
                placeholder="https://res.cloudinary.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-xs text-gray-600 font-mono"
              />
            )}
          </div>

          {/* 5. Optional Scheduling / Active Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="promo-start-date" className="text-sm font-medium text-gray-900">
                  Start Date (Optional)
                </Label>
                {startDate && (
                  <button
                    type="button"
                    onClick={() => setStartDate("")}
                    className="text-[11px] text-gray-400 hover:text-red-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Input
                id="promo-start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-gray-400">
                Banner will not appear before this date and time.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="promo-end-date" className="text-sm font-medium text-gray-900">
                  End Date (Optional)
                </Label>
                {endDate && (
                  <button
                    type="button"
                    onClick={() => setEndDate("")}
                    className="text-[11px] text-gray-400 hover:text-red-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Input
                id="promo-end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-gray-400">
                Banner will automatically stop showing after this date and time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Card */}
      <Card className="border border-orange-200/80 bg-orange-50/20 shadow-xs">
        <CardHeader className="pb-3 border-b border-orange-100/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-600" />
              <CardTitle className="text-base font-semibold text-gray-900">
                Live Homepage Banner Preview
              </CardTitle>
            </div>
            <span className="text-xs text-gray-500">
              {enabled ? "Simulating active banner" : "Banner currently marked disabled"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {title.trim() ? (
            <div className="relative overflow-hidden rounded-xl border border-orange-200/90 bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-white p-5 sm:p-6 md:p-8 shadow-sm">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
                    <Sparkles className="w-3 h-3 text-orange-600" />
                    <span>Special Update</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
                    {title.trim()}
                  </h3>

                  {description.trim() && (
                    <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
                      {description.trim()}
                    </p>
                  )}

                  <div className="mt-4">
                    <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm">
                      <span>{ctaLabel.trim() || "Explore Products →"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {imageUrl.trim() && (
                  <div className="w-full md:w-auto flex-shrink-0">
                    <div className="relative w-full sm:w-64 h-36 rounded-lg overflow-hidden border border-orange-100 bg-white">
                      <Image
                        src={imageUrl.trim()}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg bg-white">
              Enter a promotional headline above to preview how your banner will appear on the homepage.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
