"use client"

import { use, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Upload, ArrowLeft, LoaderCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApplication, useUpdateApplication, useUploadApplicationImage } from "@/hooks/queries/useApplications"
import { SEOAutoGenerateButton } from "@/components/admin/seo-auto-generate-button"
import type { ApplicationFormData } from "@/lib/types/applications"
import { toast } from "sonner"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditApplicationPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data, isLoading: isLoadingApp } = useApplication(resolvedParams.id)
  const updateMutation = useUpdateApplication()
  const uploadMutation = useUploadApplicationImage()

  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    slug: "",
    description: "",
    thumbnail_image: "",
    banner_image: "",
    image_alt: "",
    icon: "",
    sort_order: 0,
    is_active: true,
    status: "active",
    meta_title: "",
    meta_description: ""
  })

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  // Load application data
  useEffect(() => {
    if (data?.application) {
      const app = data.application
      setFormData({
        name: app.name,
        slug: app.slug,
        description: app.description || "",
        thumbnail_image: app.thumbnail_image || app.image_url || "",
        banner_image: app.banner_image || "",
        image_alt: app.image_alt || "",
        icon: app.icon || "",
        sort_order: app.sort_order,
        is_active: app.is_active,
        status: app.status,
        meta_title: app.meta_title || "",
        meta_description: app.meta_description || ""
      })
      setThumbnailPreview(app.thumbnail_image || app.image_url || "")
      if (app.banner_image) {
        setBannerImagePreview(app.banner_image)
      }
    }
  }, [data])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error('Please fill in required fields')
        return
      }

      let thumbnailUrl = formData.thumbnail_image
      let bannerImageUrl = formData.banner_image

      // Upload thumbnail if selected
      if (thumbnailFile) {
        setIsUploading(true)
        const result = await uploadMutation.mutateAsync(thumbnailFile)
        if (result.success && result.url) {
          thumbnailUrl = result.url
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

      // Update application
      const result = await updateMutation.mutateAsync({
        id: resolvedParams.id,
        data: {
          ...formData,
          thumbnail_image: thumbnailUrl,
          banner_image: bannerImageUrl,
          image_url: thumbnailUrl // Backward compatibility
        }
      })

      if (result.success) {
        toast.success('Application updated successfully!')
        router.push(`/admin/applications/${resolvedParams.id}`)
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
      setIsUploading(false)
    }
  }

  const isLoading = updateMutation.isPending || isUploading

  if (isLoadingApp) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!data?.application) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
        <Button asChild variant="outline">
          <Link href="/admin/applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Edit Application
            </h1>
            <p className="text-gray-600 mt-1">
              Update application details
            </p>
          </div>
          <Button variant="outline" asChild className="border-gray-300 bg-white">
            <Link href={`/admin/applications/${resolvedParams.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Form */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide bg-blue-100 text-blue-800">
                    Application
                  </span>
                </div>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic details about this application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Installation, Maintenance, Testing"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
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
                    placeholder="Brief description of this application..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Thumbnail Image</Label>
                  <div className="flex items-start gap-6">
                    <div
                      onClick={() => document.getElementById('thumbnail-upload')?.click()}
                      className={`h-32 w-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${thumbnailPreview ? "border-solid border-gray-200" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                    >
                      {thumbnailPreview ? (
                        <>
                          <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Preview" />
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
                        id="thumbnail-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                      <p className="text-xs text-gray-500">
                        JPG, PNG or WEBP. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visual Identity</CardTitle>
                <CardDescription>
                  Banner image for application page header (optional, non-clickable)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="banner_image">Banner Image</Label>
                  <Input
                    id="banner_image"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageChange}
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 1920x400px wide banner for application page header
                  </p>
                </div>

                {bannerImagePreview && (
                  <div className="border rounded-lg overflow-hidden">
                    <img src={bannerImagePreview} alt="Banner Preview" className="w-full h-auto" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Publish Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Status</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked, status: e.target.checked ? 'active' : 'inactive' })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </div>
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

            {/* SEO */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">SEO</CardTitle>
                  <SEOAutoGenerateButton
                    name={formData.name}
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
                    value={formData.meta_title || ""}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description || ""}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Application
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
