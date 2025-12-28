"use client"

import { useState, useEffect } from "react"
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
import type { BannerPlacement, BannerTargetType, BannerCtaStyle } from "@/lib/types/banners"

export default function EditBannerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: banner, isLoading: isLoadingBanner } = useBanner(params.id)
  const updateMutation = useUpdateBanner()
  const uploadMutation = useUploadBannerImage()

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    internal_name: "",
    image_url: "",
    image_alt: "",
    mobile_image_url: "",
    placement: "" as BannerPlacement,
    target_type: "all" as BannerTargetType,
    target_id: "",
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
        target_type: banner.target_type || "all",
        target_id: banner.target_id || "",
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
      let imageUrl = formData.image_url

      // Upload new image if selected
      if (imageFile) {
        setIsUploading(true)
        imageUrl = await uploadMutation.mutateAsync(imageFile)
        setIsUploading(false)
      }

      // Update banner
      await updateMutation.mutateAsync({
        id: params.id,
        data: {
          ...formData,
          image_url: imageUrl
        }
      })

      router.push('/admin/banners')
    } catch (error) {
      console.error('Error updating banner:', error)
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

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Banner Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Upload New Image (optional)</Label>
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
                    value={formData.image_alt}
                    onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card>
              <CardHeader>
                <CardTitle>Call to Action</CardTitle>
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

                <div className="space-y-2">
                  <Label htmlFor="cta_link">Link URL</Label>
                  <Input
                    id="cta_link"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Placement */}
            <Card>
              <CardHeader>
                <CardTitle>Placement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Banner Location</Label>
                  <Select value={formData.placement} onValueChange={(value: BannerPlacement) => setFormData({ ...formData, placement: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BANNER_PLACEMENTS.map((placement) => (
                        <SelectItem key={placement.id} value={placement.id}>
                          {placement.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Targeting */}
            <Card>
              <CardHeader>
                <CardTitle>Targeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Type</Label>
                  <Select value={formData.target_type} onValueChange={(value: BannerTargetType) => setFormData({ ...formData, target_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages</SelectItem>
                      <SelectItem value="category">Specific Category</SelectItem>
                      <SelectItem value="application">Specific Application</SelectItem>
                      <SelectItem value="collection">Specific Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.target_type !== 'all' && (
                  <div className="space-y-2">
                    <Label>Target ID</Label>
                    <Input
                      value={formData.target_id}
                      onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                    />
                  </div>
                )}
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
