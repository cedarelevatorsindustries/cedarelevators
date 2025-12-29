"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Upload, ArrowLeft, LoaderCircle, Layers } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCreateApplication, useUploadApplicationImage } from "@/hooks/queries/useApplications"
import type { ApplicationFormData } from "@/lib/types/applications"
import { toast } from "sonner"

export default function CreateApplicationPage() {
  const router = useRouter()
  const createMutation = useCreateApplication()
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
  const [isUploading, setIsUploading] = useState(false)

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

      // Upload thumbnail if selected
      if (thumbnailFile) {
        setIsUploading(true)
        const result = await uploadMutation.mutateAsync(thumbnailFile)
        if (result.success && result.url) {
          thumbnailUrl = result.url
        }
        setIsUploading(false)
      }

      // Create application
      const result = await createMutation.mutateAsync({
        ...formData,
        thumbnail_image: thumbnailUrl,
        image_url: thumbnailUrl // Backward compatibility
      })

      if (result.success && result.application) {
        toast.success('Application created successfully!')
        router.push('/admin/applications')
      }
    } catch (error) {
      console.error('Error creating application:', error)
      toast.error('Failed to create application')
      setIsUploading(false)
    }
  }

  const isLoading = createMutation.isPending || isUploading

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Create Application
            </h1>
            <p className="text-gray-600 mt-1">
              Add a new top-level application grouping
            </p>
          </div>
          <Button variant="outline" asChild className="border-gray-300 bg-white">
            <Link href="/admin/applications">
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
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-blue-800">
                  You are creating a top-level <strong>Application</strong>. It will not have a parent.
                </div>

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
                      className={`h-32 w-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
                        thumbnailPreview ? "border-solid border-gray-200" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
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
          </div>

          {/* Sidebar */}
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
                <p><strong>Applications are top-level</strong> organizational units.</p>
                <p className="text-xs text-blue-700">Categories and products will be organized under applications.</p>
                <p className="text-xs text-blue-700 pt-2">No parent selection needed for applications.</p>
              </CardContent>
            </Card>

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
                <CardTitle className="text-base">SEO</CardTitle>
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
                  Create Application
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
