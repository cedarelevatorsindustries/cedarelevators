"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Upload, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useCollection,
  useUpdateCollection,
  useUploadCollectionImage
} from "@/hooks/queries/useCollections"
import type { CollectionDisplayType, SpecialCollectionLocation } from "@/lib/types/collections"
import { generateSlug } from "@/lib/types/collections"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SEOAutoGenerateButton } from "@/components/admin/seo-auto-generate-button"

export default function EditCollectionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: collectionData, isLoading: isLoadingCollection } = useCollection(params.id)
  const updateMutation = useUpdateCollection()
  const uploadMutation = useUploadCollectionImage()

  const collection = collectionData?.collection

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    image_url: "",
    image_alt: "",
    banner_image: "",
    type: "manual" as "manual" | "automatic",
    is_active: true,
    is_featured: false,
    sort_order: 0,
    meta_title: "",
    meta_description: "",
    display_type: "normal" as CollectionDisplayType,
    special_locations: [] as SpecialCollectionLocation[]
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  // Load collection data
  useEffect(() => {
    if (collection) {
      setFormData({
        title: collection.title || "",
        slug: collection.slug || "",
        description: collection.description || "",
        image_url: collection.image_url || "",
        image_alt: collection.image_alt || "",
        banner_image: collection.banner_image || "",
        type: collection.type || "manual",
        is_active: collection.is_active ?? true,
        is_featured: collection.is_featured || false,
        sort_order: collection.sort_order || 0,
        meta_title: collection.meta_title || "",
        meta_description: collection.meta_description || "",
        display_type: collection.display_type || "normal",
        special_locations: collection.special_locations || []
      })
      if (collection.image_url) {
        setImagePreview(collection.image_url)
      }
      if (collection.banner_image) {
        setBannerImagePreview(collection.banner_image)
      }
    }
  }, [collection])

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

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    })
  }

  const handleSubmit = async () => {
    try {
      // Validate special collections have at least one location
      if (formData.display_type === 'special' && (!formData.special_locations || formData.special_locations.length === 0)) {
        toast.error('Special collections must have at least one display location selected')
        return
      }

      let imageUrl = formData.image_url
      let bannerImageUrl = formData.banner_image

      // Upload new image if selected
      if (imageFile) {
        setIsUploading(true)
        const result = await uploadMutation.mutateAsync(imageFile)
        if (result.success && result.url) {
          imageUrl = result.url
        }
        setIsUploading(false)
      }

      // Upload banner image if selected
      if (bannerImageFile) {
        setIsUploading(true)
        const result = await uploadMutation.mutateAsync(bannerImageFile)
        if (result.success && result.url) {
          bannerImageUrl = result.url
        }
        setIsUploading(false)
      }

      // Update collection metadata
      const result = await updateMutation.mutateAsync({
        id: params.id,
        data: {
          ...formData,
          image_url: imageUrl,
          banner_image: bannerImageUrl
        }
      })

      if (result.success) {
        toast.success('Collection updated successfully!')
        router.push('/admin/collections')
      }
    } catch (error) {
      console.error('Error updating collection:', error)
      toast.error('Failed to update collection')
      setIsUploading(false)
    }
  }

  if (isLoadingCollection) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const isLoading = updateMutation.isPending || isUploading

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Edit Collection
            </h1>
            <p className="text-gray-600 mt-1">
              Update collection information
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/admin/collections">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
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

        {/* Main Form */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Collection Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Collection Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Display Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Control where and how this collection appears</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Type Selector */}
                <div className="space-y-3">
                  <Label>Display Type *</Label>
                  <RadioGroup
                    value={formData.display_type}
                    onValueChange={(value: CollectionDisplayType) => {
                      setFormData({
                        ...formData,
                        display_type: value,
                        special_locations: value === 'normal' ? [] : formData.special_locations
                      })
                    }}
                  >
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
                      <RadioGroupItem value="normal" id="normal" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="normal" className="font-medium cursor-pointer">Normal Collection</Label>
                        <p className="text-xs text-gray-500 mt-1">Displayed on the homepage</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
                      <RadioGroupItem value="special" id="special" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="special" className="font-medium cursor-pointer">Special Collection</Label>
                        <p className="text-xs text-gray-500 mt-1">Displayed in Categories tab and/or Business Hub</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Special Locations - Only show if display_type is 'special' */}
                {formData.display_type === 'special' && (
                  <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <Label className="text-orange-900">Display Locations *</Label>
                      <p className="text-xs text-orange-700 mt-1">Select where this collection should appear (at least one required)</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="categories"
                          checked={formData.special_locations?.includes('categories')}
                          onCheckedChange={(checked) => {
                            const locations = formData.special_locations || []
                            if (checked) {
                              setFormData({ ...formData, special_locations: [...locations, 'categories'] })
                            } else {
                              setFormData({ ...formData, special_locations: locations.filter(l => l !== 'categories') })
                            }
                          }}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label htmlFor="categories" className="font-medium cursor-pointer">Categories Tab</Label>
                          <p className="text-xs text-gray-600 mt-1">Show in the Categories section</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="business_hub"
                          checked={formData.special_locations?.includes('business_hub')}
                          onCheckedChange={(checked) => {
                            const locations = formData.special_locations || []
                            if (checked) {
                              setFormData({ ...formData, special_locations: [...locations, 'business_hub'] })
                            } else {
                              setFormData({ ...formData, special_locations: locations.filter(l => l !== 'business_hub') })
                            }
                          }}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label htmlFor="business_hub" className="font-medium cursor-pointer">Business Hub Tab</Label>
                          <p className="text-xs text-gray-600 mt-1">Show in the Business Hub section</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Feature Image</Label>
                  <div className="flex items-start gap-6">
                    <div
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className={cn(
                        "h-32 w-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden",
                        imagePreview ? "border-solid border-gray-200" : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                      )}
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                            Change
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">Upload</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="image_alt">Alt Text</Label>
                        <Input
                          id="image_alt"
                          placeholder="Describe image for accessibility"
                          value={formData.image_alt || ""}
                          onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                        />
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <p className="text-xs text-gray-500">
                        JPG, PNG or WEBP. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Golden Rule Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2 text-base">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cedar Golden Rule
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-900 space-y-2">
                <p><strong>Products assign themselves</strong> to collections.</p>
                <p className="text-xs text-blue-700">To manage products in this collection, edit individual products in their Organization tab.</p>
                <p className="text-xs text-blue-700 pt-2">View assigned products on the collection detail page.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Featured</Label>
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">SEO</CardTitle>
                  <SEOAutoGenerateButton
                    name={formData.title}
                    description={formData.description}
                    onGenerate={(data) => setFormData({
                      ...formData,
                      meta_title: data.meta_title,
                      meta_description: data.meta_description
                    })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
