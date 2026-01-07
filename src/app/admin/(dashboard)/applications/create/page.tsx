"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowRight, ArrowLeft, FileText, Image, Search, Eye, CheckCircle2, AlertCircle, ClipboardCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useCreateApplication, useUpdateApplication, useUploadApplicationImage, useApplication } from "@/hooks/queries/useApplications"
import type { ApplicationFormData } from "@/lib/types/applications"
import { ApplicationPreview } from "./application-preview"
import { CatalogBanner } from "@/modules/catalog/components/catalog-banner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateApplicationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('id')
  const isEditMode = !!applicationId

  const { data: existingData, isLoading: isLoadingExisting } = useApplication(applicationId || '')
  const createMutation = useCreateApplication()
  const updateMutation = useUpdateApplication()
  const uploadMutation = useUploadApplicationImage()

  const [activeTab, setActiveTab] = useState("basic")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    slug: "",
    description: "",
    subtitle: "",
    thumbnail_image: "",
    banner_image: "",
    image_alt: "",
    badge_text: "",
    badge_color: "#f97316",
    card_position: "image-top",
    default_sort: "newest",
    sort_order: 0,
    is_active: true,
    status: "draft",
    visibility: "public",
    meta_title: "",
    meta_description: ""
  })

  // Load existing data when editing
  useEffect(() => {
    if (isEditMode && existingData?.application) {
      const app = existingData.application
      setFormData({
        name: app.title || app.name || "",
        slug: app.handle || app.slug || "",
        description: app.description || "",
        subtitle: app.subtitle || "",
        thumbnail_image: app.thumbnail || app.thumbnail_image || app.image_url || "",
        banner_image: app.banner_url || app.banner_image || "",
        image_alt: app.metadata?.image_alt || app.image_alt || "",
        badge_text: app.metadata?.badge_text || app.badge_text || "",
        badge_color: app.metadata?.badge_color || app.badge_color || "#f97316",
        card_position: app.card_position || "image-top",
        default_sort: app.default_sort || "newest",
        sort_order: app.metadata?.sort_order || app.sort_order || 0,
        is_active: app.is_active ?? true,
        status: app.status || "draft",
        visibility: app.visibility || "public",
        meta_title: app.seo_meta_title || app.meta_title || "",
        meta_description: app.seo_meta_description || app.meta_description || ""
      })
    }
  }, [isEditMode, existingData])

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

  const handleAutoGenerateSEO = () => {
    const title = `${formData.name}${formData.subtitle ? ' - ' + formData.subtitle : ''}${formData.badge_text ? ' | ' + formData.badge_text : ''}`
    const description = formData.description || `Explore our ${formData.name} products and solutions.`

    setFormData({
      ...formData,
      meta_title: title.substring(0, 60),
      meta_description: description.substring(0, 160)
    })
    toast.success("SEO fields auto-generated!")
  }

  const handleSubmit = async (isDraft = false) => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error('Please fill in required fields')
        return
      }

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

      const payload = {
        ...formData,
        thumbnail_image: thumbnailUrl,
        banner_image: bannerUrl,
        image_url: thumbnailUrl, // Backward compatibility
        status: isDraft ? 'draft' : formData.status
      }

      // Create or update application
      const result = isEditMode
        ? await updateMutation.mutateAsync({ id: applicationId!, data: payload })
        : await createMutation.mutateAsync(payload)

      if (result.success && result.application) {
        toast.success(isDraft ? 'Draft saved successfully' : isEditMode ? 'Application updated successfully!' : 'Application created successfully!')
        router.push('/admin/applications')
      }
    } catch (error) {
      console.error('Error saving application:', error)
      toast.error(isEditMode ? 'Failed to update application' : 'Failed to create application')
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
    { id: "media", label: "Media", icon: <Image className="h-4 w-4" /> },
    { id: "seo", label: "SEO", icon: <Search className="h-4 w-4" /> },
    { id: "review", label: "Review & Publish", icon: <ClipboardCheck className="h-4 w-4" /> }
  ]

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab)
  const canGoNext = currentTabIndex < tabs.length - 1
  const canGoPrevious = currentTabIndex > 0

  const goToNextTab = () => {
    if (canGoNext) {
      setActiveTab(tabs[currentTabIndex + 1].id)
    }
  }

  const goToPreviousTab = () => {
    if (canGoPrevious) {
      setActiveTab(tabs[currentTabIndex - 1].id)
    }
  }

  const canPublish = () => {
    return formData.name && formData.slug
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              {isEditMode ? 'Edit Application' : 'Create Application'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              {isEditMode ? 'Update application details' : 'Add a new top-level application grouping'}
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button variant="outline" asChild className="bg-white border-gray-200 hover:bg-gray-50">
              <Link href="/admin/applications">Cancel</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isLoading || !formData.name}
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
        <div className={activeTab === 'review' ? "max-w-3xl mx-auto w-full space-y-8" : "grid gap-6 lg:gap-8 lg:grid-cols-4 w-full"}>
          <div className={activeTab === 'review' ? "w-full space-y-8" : "lg:col-span-3 min-w-0 w-full space-y-6"}>
            {/* Tab 1: Basic Info */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-1">Step 1: Define Application Identity</h3>
                  <p className="text-sm text-blue-700">Basic information that identifies this application in your catalog</p>
                </div>

                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-white border-b border-gray-200">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      General Information
                      {formData.name.length >= 3 && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>Basic details about this application</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          Name <span className="text-red-500">*</span>
                          {formData.name && (
                            formData.name.length >= 3 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            )
                          )}
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g., Erection, Testing"
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          {formData.name.length > 0 ? `${formData.name.length} characters` : 'Minimum 3 characters required'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input
                          id="subtitle"
                          placeholder="Optional tagline"
                          value={formData.subtitle || ""}
                          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
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
                      <p className="text-xs text-gray-500">
                        {formData.description?.length || 0} characters • Keep it concise and informative
                      </p>
                    </div>

                    {/* Badge */}
                    <Card className="bg-orange-50 border-orange-200">
                      <CardHeader>
                        <CardTitle className="text-base">Badge (Optional)</CardTitle>
                        <CardDescription>Add a badge to highlight this application</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="badge-text">Badge Text</Label>
                            <Input
                              id="badge-text"
                              placeholder="e.g., New, Popular"
                              value={formData.badge_text || ""}
                              onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="badge-color">Badge Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="badge-color"
                                type="color"
                                value={formData.badge_color || "#f97316"}
                                onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                                className="w-20 h-10"
                              />
                              <Input
                                value={formData.badge_color || "#f97316"}
                                onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Preview */}
                        {formData.badge_text && (
                          <div className="pt-2">
                            <Label className="text-xs text-gray-600">Preview:</Label>
                            <div className="mt-2">
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: formData.badge_color }}
                              >
                                {formData.badge_text}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab 2: Media */}
            {activeTab === "media" && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50/100 border-b border-gray-200">
                  <CardTitle>Media Assets</CardTitle>
                  <CardDescription>Upload one thumbnail and one banner image for this application</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Thumbnail Upload */}
                  <div className="space-y-2">
                    <Label>Thumbnail Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setThumbnailFile(file)
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setFormData({ ...formData, thumbnail_image: reader.result as string })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="max-w-xs mx-auto"
                      />
                      {formData.thumbnail_image && (
                        <div className="mt-4">
                          <img src={formData.thumbnail_image} alt="Thumbnail preview" className="max-w-xs mx-auto rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setBannerFile(file)
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setFormData({ ...formData, banner_image: reader.result as string })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="max-w-xs mx-auto"
                      />
                      {formData.banner_image && (
                        <div className="mt-4">
                          <img src={formData.banner_image} alt="Banner preview" className="max-w-full mx-auto rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Alt Text */}
                  <div className="space-y-2">
                    <Label htmlFor="image-alt">Image Alt Text</Label>
                    <Input
                      id="image-alt"
                      placeholder="Describe the image for accessibility"
                      value={formData.image_alt || ""}
                      onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}



            {/* Tab 4: SEO */}
            {activeTab === "seo" && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50/100 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>SEO Settings</CardTitle>
                      <CardDescription>Optimize for search engines</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoGenerateSEO}
                      disabled={!formData.name}
                    >
                      Auto-Generate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="home-elevators"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      URL: /catalog/applications/{formData.slug || "your-slug"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <Input
                      id="meta-title"
                      placeholder="Application Name - Cedar Elevators"
                      value={formData.meta_title || ""}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500">{formData.meta_title?.length || 0}/60 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Textarea
                      id="meta-description"
                      placeholder="Brief description for search results..."
                      value={formData.meta_description || ""}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500">{formData.meta_description?.length || 0}/160 characters</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab 5: Review & Publish */}
            {activeTab === "review" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold text-gray-900">Review Application</h3>
                  <p className="text-gray-500">Preview how your application will look on the storefront and set its status.</p>
                </div>

                {/* Section 1: Thumbnail Preview */}
                <div className="bg-gray-50/50 p-8 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-medium text-center text-gray-700 mb-6">Thumbnail Preview</h4>
                  <div className="flex justify-center">
                    <ApplicationPreview
                      name={formData.name}
                      description={formData.description}
                      imageUrl={formData.thumbnail_image}
                      badgeText={formData.badge_text}
                      badgeColor={formData.badge_color}
                      status={formData.status}
                    />
                  </div>
                </div>

                {/* Section 2: Banner Preview */}
                <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="text-lg font-medium text-center text-gray-700">Application Banner Preview</h4>
                  </div>
                  <div className="relative">
                    {/* Scale down the banner slightly to fit nicely in the preview area if needed, or show full width */}
                    <div className="transform scale-[0.8] origin-top -mb-[20%] md:scale-100 md:mb-0">
                      <CatalogBanner
                        title={formData.name || "Application Name"}
                        subtitle={formData.description}
                        backgroundImage={formData.banner_image || formData.thumbnail_image}
                        type="application"
                        categories={[]} // Empty categories for preview
                        variant="full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  {/* Section 3: Quick Summary */}
                  <Card className="border-gray-200 shadow-sm h-full">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-200 pb-4">
                      <CardTitle className="text-lg">Quick Summary</CardTitle>
                      <CardDescription>Overview of configured settings</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">Application Name</span>
                        <span className="text-sm font-medium">{formData.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">URL Slug</span>
                        <span className="text-sm font-medium text-gray-500 font-mono text-xs">{formData.slug || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">Assets</span>
                        <span className="text-sm font-medium">
                          {formData.thumbnail_image ? 'Thumbnail Set' : 'No Thumbnail'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">SEO Title</span>
                        <span className="text-sm font-medium">
                          {formData.meta_title ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <span className="text-gray-400">-</span>}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Section 4: Publish Status */}
                  <Card className="border-gray-200 shadow-sm h-full">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-200 pb-4">
                      <CardTitle className="text-lg">Publishing Status</CardTitle>
                      <CardDescription>Control visibility in the catalog</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Application Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                                  Draft
                                </div>
                              </SelectItem>
                              <SelectItem value="active">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-green-500" />
                                  Active
                                </div>
                              </SelectItem>
                              <SelectItem value="archived">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-red-500" />
                                  Archived
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                          <p className="font-medium mb-1">
                            {formData.status === 'active' ? '🚀 Public on Storefront' :
                              formData.status === 'draft' ? '📝 Hidden from Storefront' :
                                '📦 Archived (Hidden)'}
                          </p>
                          <p className="text-blue-600/80 text-xs">
                            {formData.status === 'active' ? 'Customers can view and filter by this application.' :
                              'Only administrators can see this application.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}


            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={goToPreviousTab}
                disabled={!canGoPrevious}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {canGoNext ? (
                <Button
                  onClick={goToNextTab}
                  className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading || !canPublish()}
                  className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Publishing..." : "Publish Application"}
                </Button>
              )}
            </div>
          </div >

          {/* Preview Panel - Show only for non-review steps */}
          {activeTab !== 'review' && (
            <div className="lg:col-span-1 min-w-0 w-full">
              <div className="sticky top-6 space-y-4">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50/100 border-b border-gray-200">
                    <CardTitle className="text-base">Storefront Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex justify-center overflow-hidden">
                    <div className="w-full max-w-[260px] transform scale-95 transition-transform duration-300">
                      <ApplicationPreview
                        name={formData.name}
                        description={formData.description}
                        imageUrl={formData.thumbnail_image}
                        badgeText={formData.badge_text}
                        badgeColor={formData.badge_color}
                        status={formData.status}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div >
    </div >
  )
}

