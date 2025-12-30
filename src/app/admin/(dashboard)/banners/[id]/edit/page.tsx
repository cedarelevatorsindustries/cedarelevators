"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useBanner, useUpdateBanner, useUploadBannerImage } from "@/hooks/queries/useBanners"
import { BANNER_PLACEMENTS } from "@/lib/types/banners"
// import {
//   getBannerSlides,
//   createBannerSlide,
//   updateBannerSlide,
//   deleteBannerSlide
// } from "@/lib/actions/banner-slides"
import { toast } from "sonner"
import type { BannerPlacement, BannerLinkType, BannerCtaStyle, BannerSlide } from "@/lib/types/banners"
import { EntitySelector } from "@/components/admin/entity-selector"
import { BannerSlideManager } from "@/components/admin/banner-slide-manager"

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const { data: banner, isLoading: isLoadingBanner } = useBanner(id)
  const updateMutation = useUpdateBanner()
  const uploadMutation = useUploadBannerImage()

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    internal_name: "",
    image_url: "",
    image_alt: "",
    mobile_image_url: "",
    placement: "hero-carousel" as BannerPlacement,
    link_type: "" as BannerLinkType,
    link_id: "",
    cta_text: "",
    cta_link: "",
    cta_style: "primary" as BannerCtaStyle,
    start_date: "",
    end_date: "",
    is_active: true,
    position: 0,
    background_color: "",
    text_color: "white"
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [slides, setSlides] = useState<BannerSlide[]>([])

  const [originalSlides, setOriginalSlides] = useState<BannerSlide[]>([])

  // Populate form when banner loads
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || "",
        internal_name: banner.internal_name,
        image_url: banner.image_url,
        image_alt: banner.image_alt || "",
        mobile_image_url: banner.mobile_image_url || "",
        placement: banner.placement,
        link_type: (banner.link_type || banner.target_type || "") as BannerLinkType,
        link_id: banner.link_id || banner.target_id || "",
        cta_text: banner.cta_text || "",
        cta_link: banner.cta_link || "",
        cta_style: banner.cta_style,
        start_date: banner.start_date ? new Date(banner.start_date).toISOString().slice(0, 16) : "",
        end_date: banner.end_date ? new Date(banner.end_date).toISOString().slice(0, 16) : "",
        is_active: banner.is_active,
        position: banner.position,
        background_color: banner.background_color || "",
        text_color: banner.text_color
      })
      setImagePreview(banner.image_url)

      // Load slides from banner object
      if (banner.slides && banner.slides.length > 0) {
        setSlides(banner.slides)
        setOriginalSlides(banner.slides)
      }
    }
  }, [banner])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      if (slides.length === 0) {
        toast.error('Please add at least one slide')
        return
      }

      setIsUploading(true)

      // Fallback main image (first slide)
      const mainImage = slides[0].image_url
      const mainMobileImage = slides[0].mobile_image_url

      // Update banner with slides
      await updateMutation.mutateAsync({
        id: id,
        data: {
          ...formData,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          image_url: mainImage,
          mobile_image_url: mainMobileImage || "",
          // Ensure optional fields are handled
          cta_text: formData.cta_text || undefined,
          link_type: formData.link_type || undefined,
          link_id: formData.link_id || undefined,
          // Save slides as JSONB
          slides: slides.map((slide, index) => ({
            ...slide,
            sort_order: index
          }))
        }
      })

      toast.success('Banner updated successfully')
      router.push('/admin/banners')
    } catch (error) {
      console.error('Error updating banner:', error)
      toast.error('Failed to update banner')
    } finally {
      setIsUploading(false)
    }
  }

  const isLoading = updateMutation.isPending || isUploading || isLoadingBanner

  if (isLoadingBanner) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!banner) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Banner not found</h2>
        <Button asChild className="mt-4">
          <Link href="/admin/banners">Back to Banners</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Edit Banner
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              {banner.internal_name}
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button variant="outline" asChild>
              <Link href="/admin/banners">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="internal_name">Internal Name *</Label>
                  <Input
                    id="internal_name"
                    value={formData.internal_name}
                    onChange={(e) => setFormData({ ...formData, internal_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Banner Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Carousel Slides */}
            <BannerSlideManager
              slides={slides}
              onSlidesChange={setSlides}
              isEditing={true}
            />

            {/* Call to Action */}
            <Card>
              <CardHeader>
                <CardTitle>Call to Action *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta_text">Button Text</Label>
                    <Input
                      id="cta_text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Optional</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta_style">Button Style</Label>
                    <Select value={formData.cta_style} onValueChange={(value) => setFormData({ ...formData, cta_style: value as BannerCtaStyle })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Link Destination */}
            <Card>
              <CardHeader>
                <CardTitle>Link Destination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Link Type</Label>
                  <Select value={formData.link_type} onValueChange={(value) => setFormData({ ...formData, link_type: value as BannerLinkType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="elevator-type">Elevator Type</SelectItem>
                      <SelectItem value="collection">Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.link_type && (
                  <EntitySelector
                    type={formData.link_type}
                    value={formData.link_id}
                    onChange={(value) => setFormData({ ...formData, link_id: value })}
                  />
                )}</CardContent>
            </Card>

            {/* Placement (Read-only info) */}
            <Card>
              <CardHeader>
                <CardTitle>Placement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Catalog Carousel</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Catalog carousel for product discovery navigation (3-5 slides recommended)
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    ℹ️ All banners here are part of the catalog carousel
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Display */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Display</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    type="number"
                    min="0"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-500">Lower numbers appear first in carousel</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
