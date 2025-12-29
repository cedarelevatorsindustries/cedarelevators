"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, ArrowLeft, LoaderCircle, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCreateBanner, useUploadBannerImage } from "@/hooks/queries/useBanners"
import { BANNER_PLACEMENTS } from "@/lib/types/banners"
import type { BannerPlacement, BannerLinkType, BannerCtaStyle } from "@/lib/types/banners"
import { BannerPhilosophyCard } from "@/components/admin/banner-philosophy-card"

export default function CreateBannerPage() {
  const router = useRouter()
  const createMutation = useCreateBanner()
  const uploadMutation = useUploadBannerImage()

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    internal_name: "",
    image_url: "",
    image_alt: "",
    mobile_image_url: "",
    placement: "hero-carousel" as BannerPlacement, // Hardcoded to All Products Carousel
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

  const handleSubmit = async (isDraft = false) => {
    try {
      // Validate required fields
      if (!formData.title || !formData.internal_name || !imageFile) {
        alert('Please fill in all required fields and upload an image')
        return
      }

      // Validate link destination (required for carousel)
      if (!formData.link_type || !formData.link_id) {
        alert('Link destination is required. Please select link type and link ID.')
        return
      }

      // Validate CTA text (required for carousel)
      if (!formData.cta_text) {
        alert('CTA text is required for carousel banners.')
        return
      }

      // Upload image first
      setIsUploading(true)
      const imageUrl = await uploadMutation.mutateAsync(imageFile)
      setIsUploading(false)

      // Create banner
      await createMutation.mutateAsync({
        ...formData,
        image_url: imageUrl,
        is_active: !isDraft
      })

      router.push('/admin/banners')
    } catch (error) {
      console.error('Error creating banner:', error)
      setIsUploading(false)
    }
  }

  const isLoading = createMutation.isPending || isUploading

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Create Carousel Banner
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              Add a new banner to the All Products carousel for discovery navigation
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
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
            >
              Save as Draft
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Publish Banner
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Philosophy Card */}
            <BannerPhilosophyCard />

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
                    placeholder="e.g., Summer Sale 2024 - Homepage"
                    value={formData.internal_name}
                    onChange={(e) => setFormData({ ...formData, internal_name: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">For admin reference only</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Banner Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Summer Sale - Up to 50% Off"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    placeholder="e.g., Get the best deals on elevator components"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Banner Image *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={() => document.getElementById('image')?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Browse
                    </Button>
                  </div>
                </div>

                {imagePreview && (
                  <div className="border rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-auto" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="image_alt">Image Alt Text</Label>
                  <Input
                    id="image_alt"
                    placeholder="Describe the image for accessibility"
                    value={formData.image_alt}
                    onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card>
              <CardHeader>
                <CardTitle>Call to Action *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta_text">Button Text *</Label>
                    <Input
                      id="cta_text"
                      placeholder="e.g., Shop Now, View Products"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500">Required for carousel banners</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta_style">Button Style</Label>
                    <Select value={formData.cta_style} onValueChange={(value: BannerCtaStyle) => setFormData({ ...formData, cta_style: value })}>
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
                <CardTitle>Link Destination *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Link Type *</Label>
                  <Select value={formData.link_type} onValueChange={(value: BannerLinkType) => setFormData({ ...formData, link_type: value, link_id: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select link type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="elevator-type">Elevator Type</SelectItem>
                      <SelectItem value="collection">Collection</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Where this banner links to</p>
                </div>

                {formData.link_type && (
                  <div className="space-y-2">
                    <Label>Link ID *</Label>
                    <Input
                      placeholder={`Enter ${formData.link_type} ID`}
                      value={formData.link_id}
                      onChange={(e) => setFormData({ ...formData, link_id: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      The ID of the {formData.link_type} to link to
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Placement (Read-only info) */}
            <Card>
              <CardHeader>
                <CardTitle>Placement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">All Products Carousel</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Homepage carousel for product discovery navigation (3-5 slides recommended)
                  </p>
                </div>
                <p className="text-xs text-blue-600">
                  ℹ️ All banners here are part of the homepage carousel
                </p>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
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
                  <p className="text-xs text-gray-500">Lower numbers appear first</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="background_color">Background</Label>
                    <Input
                      id="background_color"
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text_color">Text Color</Label>
                    <Input
                      id="text_color"
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}