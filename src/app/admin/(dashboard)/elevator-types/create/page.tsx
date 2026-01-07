"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowRight, ArrowLeft, FileText, Image as ImageIcon, Search, CheckCircle2, Loader2, ClipboardCheck } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useCreateElevatorType, useUpdateElevatorType, useUploadElevatorTypeImage, useElevatorType } from "@/hooks/queries/useElevatorTypes"
import type { ElevatorTypeFormData, ElevatorTypeStatus } from "@/lib/types/elevator-types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateElevatorTypePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const elevatorTypeId = searchParams.get('id')
  const isEditMode = !!elevatorTypeId

  const { data: existingData, isLoading: isLoadingExisting } = useElevatorType(elevatorTypeId || '')
  const createMutation = useCreateElevatorType()
  const updateMutation = useUpdateElevatorType()
  const uploadMutation = useUploadElevatorTypeImage()

  const [activeTab, setActiveTab] = useState("basic")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<ElevatorTypeFormData>({
    title: "",
    subtitle: "",
    slug: "",
    description: "",
    thumbnail_image: "",
    banner_image: "",
    status: "draft",
    meta_title: "",
    meta_description: ""
  })

  // Load existing data when editing
  useEffect(() => {
    if (isEditMode && existingData?.elevatorType) {
      const type = existingData.elevatorType
      setFormData({
        title: type.title || "",
        subtitle: type.subtitle || "",
        slug: type.slug || "",
        description: type.description || "",
        thumbnail_image: type.thumbnail_image || "",
        banner_image: type.banner_image || "",
        status: (type.status as 'active' | 'draft' | 'archived') || "draft",
        meta_title: type.meta_title || "",
        meta_description: type.meta_description || ""
      })
    }
  }, [isEditMode, existingData])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    })
  }

  const handleAutoGenerateSEO = () => {
    const title = `${formData.title} | Cedar Elevators`
    const description = formData.description || `Explore our ${formData.title} elevator solutions.`

    setFormData({
      ...formData,
      meta_title: title,
      meta_description: description.substring(0, 160)
    })

    toast.success('SEO fields auto-generated')
  }

  const handleSubmit = async (isDraft: boolean) => {
    if (!formData.title || !formData.slug) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsUploading(true)

      let thumbnailUrl = formData.thumbnail_image
      let bannerUrl = formData.banner_image

      // Upload thumbnail if selected
      if (thumbnailFile) {
        const result = await uploadMutation.mutateAsync(thumbnailFile)
        if (result.success && result.url) {
          thumbnailUrl = result.url
        }
      }

      // Upload banner if selected
      if (bannerFile) {
        const result = await uploadMutation.mutateAsync(bannerFile)
        if (result.success && result.url) {
          bannerUrl = result.url
        }
      }

      const payload: ElevatorTypeFormData = {
        ...formData,
        thumbnail_image: thumbnailUrl,
        banner_image: bannerUrl,
        status: (isDraft ? 'inactive' : formData.status) as ElevatorTypeStatus
      }

      const result = isEditMode
        ? await updateMutation.mutateAsync({ id: elevatorTypeId!, data: payload as any })
        : await createMutation.mutateAsync(payload as any)

      if (result.success && result.elevatorType) {
        router.push('/admin/elevator-types')
      }
    } catch (error) {
      console.error('Error saving elevator type:', error)
      // Toast is handled by mutation hooks
    } finally {
      setIsUploading(false)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || isUploading

  if (isEditMode && isLoadingExisting) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <FileText className="h-4 w-4" /> },
    { id: "media", label: "Media", icon: <ImageIcon className="h-4 w-4" /> },
    { id: "seo", label: "SEO", icon: <Search className="h-4 w-4" /> },
    { id: "review", label: "Review", icon: <ClipboardCheck className="h-4 w-4" /> }
  ]

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab)

  const canPublish = () => {
    return formData.title && formData.slug
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              {isEditMode ? 'Edit Elevator Type' : 'Create Elevator Type'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              {isEditMode ? 'Update elevator type details' : 'Add a new elevator type'}
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button variant="outline" asChild className="bg-white border-gray-200 hover:bg-gray-50">
              <Link href="/admin/elevator-types">Cancel</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isLoading || !formData.title}
              className="bg-white border-gray-200 hover:bg-gray-50"
            >
              Save as Draft
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
              onClick={() => handleSubmit(false)}
              disabled={isLoading || !canPublish()}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentTabIndex + 1} of {tabs.length}
            </span>
            <Badge variant={canPublish() ? "default" : "secondary"}>
              {canPublish() ? "Ready to publish" : "Fill required fields"}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentTabIndex + 1) / tabs.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-2">
          <div className="flex w-full gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                  ? "bg-orange-100 text-orange-900 border border-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Basic details about this elevator type</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="title">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g., Passenger Elevators"
                        required
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="Short subtitle or tagline..."
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="slug">
                        URL Slug <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="passenger-elevators"
                        required
                        className="bg-white font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">Auto-generated from title, but you can customize it</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Describe this elevator type..."
                      className="bg-white resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) => setFormData({ ...formData, status: val as ElevatorTypeStatus })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button variant="ghost" disabled>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => setActiveTab("media")} className="bg-orange-600 hover:bg-orange-700">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Media Tab */}
            {activeTab === "media" && (
              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                  <CardDescription>Upload images for this elevator type</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Thumbnail Upload */}
                  <div className="space-y-2">
                    <Label>Thumbnail Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      {(thumbnailFile || formData.thumbnail_image) ? (
                        <div className="space-y-4">
                          <img
                            src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : (formData.thumbnail_image ?? '')}
                            alt="Thumbnail preview"
                            className="mx-auto h-48 w-auto rounded-lg border-2 border-gray-200"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setThumbnailFile(null)
                              setFormData({ ...formData, thumbnail_image: "" })
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && setThumbnailFile(e.target.files[0])}
                            className="hidden"
                            id="thumbnail-upload"
                          />
                          <label htmlFor="thumbnail-upload">
                            <Button variant="outline" size="sm" asChild>
                              <span>Upload Thumbnail</span>
                            </Button>
                          </label>
                          <p className="text-xs text-gray-500 mt-2">Recommended: 400x400px, max 2MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      {(bannerFile || formData.banner_image) ? (
                        <div className="space-y-4">
                          <img
                            src={bannerFile ? URL.createObjectURL(bannerFile) : (formData.banner_image ?? '')}
                            alt="Banner preview"
                            className="mx-auto h-48 w-auto rounded-lg border-2 border-gray-200"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBannerFile(null)
                              setFormData({ ...formData, banner_image: "" })
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && setBannerFile(e.target.files[0])}
                            className="hidden"
                            id="banner-upload"
                          />
                          <label htmlFor="banner-upload">
                            <Button variant="outline" size="sm" asChild>
                              <span>Upload Banner</span>
                            </Button>
                          </label>
                          <p className="text-xs text-gray-500 mt-2">Recommended: 1920x600px, max 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button variant="ghost" onClick={() => setActiveTab("basic")}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => setActiveTab("seo")} className="bg-orange-600 hover:bg-orange-700">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Optimization</CardTitle>
                  <CardDescription>Improve search engine visibility</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">Auto-generate SEO fields based on basic info</p>
                    <Button variant="outline" size="sm" onClick={handleAutoGenerateSEO}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Auto-Generate
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title || ''}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="Elevator Type | Cedar Elevators"
                      className="bg-white"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500">{formData.meta_title?.length || 0}/60 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description || ''}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={3}
                      placeholder="A brief description for search engines..."
                      className="bg-white resize-none"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500">{formData.meta_description?.length || 0}/160 characters</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button variant="ghost" onClick={() => setActiveTab("media")}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => setActiveTab("review")} className="bg-orange-600 hover:bg-orange-700">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Tab */}
            {activeTab === "review" && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Publish</CardTitle>
                  <CardDescription>Review your changes before publishing</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Basic Information Preview */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-500" />
                      Basic Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Title</p>
                          <p className="text-sm text-gray-900 mt-1">{formData.title || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Slug</p>
                          <p className="text-sm text-gray-900 mt-1 font-mono">{formData.slug || "—"}</p>
                        </div>
                      </div>
                      {formData.subtitle && (
                        <div>
                          <p className="text-xs font-medium text-gray-600">Subtitle</p>
                          <p className="text-sm text-gray-900 mt-1">{formData.subtitle}</p>
                        </div>
                      )}
                      {formData.description && (
                        <div>
                          <p className="text-xs font-medium text-gray-600">Description</p>
                          <p className="text-sm text-gray-700 mt-1">{formData.description}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Status</p>
                          <Badge
                            variant="outline"
                            className={formData.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200 mt-1"
                              : formData.status === "draft"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200 mt-1"
                                : "bg-gray-50 text-gray-700 border-gray-200 mt-1"}
                          >
                            {formData.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media Preview */}
                  {(thumbnailFile || bannerFile || formData.thumbnail_image || formData.banner_image) && (
                    <div>

                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-orange-500" />
                        Media
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {(thumbnailFile || formData.thumbnail_image) && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">Thumbnail</p>
                            <img
                              src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : (formData.thumbnail_image ?? '')}
                              alt="Thumbnail preview"
                              className="h-32 w-auto rounded-lg border-2 border-gray-200"
                            />
                          </div>
                        )}
                        {(bannerFile || formData.banner_image) && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">Banner</p>
                            <img
                              src={bannerFile ? URL.createObjectURL(bannerFile) : (formData.banner_image ?? '')}
                              alt="Banner preview"
                              className="h-32 w-auto rounded-lg border-2 border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SEO Preview */}
                  {(formData.meta_title || formData.meta_description) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Search className="h-4 w-4 text-orange-500" />
                        SEO Information
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {formData.meta_title && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Meta Title</p>
                            <p className="text-sm text-gray-900 mt-1">{formData.meta_title}</p>
                          </div>
                        )}
                        {formData.meta_description && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Meta Description</p>
                            <p className="text-sm text-gray-700 mt-1">{formData.meta_description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation Messages */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Ready to Publish</h4>
                        <p className="text-xs text-blue-700">
                          All required fields are filled. Click "Publish" to make this elevator type live, or "Save as Draft" to save your progress.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button variant="ghost" onClick={() => setActiveTab("seo")}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSubmit(true)}
                        disabled={isLoading || !formData.title}
                      >
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => handleSubmit(false)}
                        disabled={isLoading || !canPublish()}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? "Publishing..." : "Publish"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Title</p>
                  <p className="text-sm text-gray-900 mt-1">{formData.title || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Slug</p>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{formData.slug || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge
                    variant="outline"
                    className={formData.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200 mt-1"
                      : formData.status === "draft"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200 mt-1"
                        : "bg-gray-50 text-gray-700 border-gray-200 mt-1"}
                  >
                    {formData.status}
                  </Badge>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    All changes will be saved when you click Publish or Save as Draft
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div >
  )
}
