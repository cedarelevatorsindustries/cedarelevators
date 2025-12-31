"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Image, Layout, Search, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useCreateApplication, useUploadApplicationImage } from "@/hooks/queries/useApplications"
import type { ApplicationFormData } from "@/lib/types/applications"
import { TabLayout, TabPanel } from "@/components/admin/catalog/tab-layout"
import { RightContextPanel } from "@/components/admin/catalog/right-context-panel"
import { MediaUploadTab } from "@/components/admin/catalog/media-upload-tab"
import { DisplayRulesTab, CardPosition, SortRule } from "@/components/admin/catalog/display-rules-tab"
import { SEOTab } from "@/components/admin/catalog/seo-tab"

export default function CreateApplicationPage() {
  const router = useRouter()
  const createMutation = useCreateApplication()
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

  const handleSubmit = async () => {
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

      // Create application
      const result = await createMutation.mutateAsync({
        ...formData,
        thumbnail_image: thumbnailUrl,
        banner_image: bannerUrl,
        image_url: thumbnailUrl // Backward compatibility
      })

      if (result.success && result.application) {
        toast.success('Application created successfully!')
        router.push('/admin/applications')
      }
    } catch (error) {
      console.error('Error creating application:', error)
      toast.error('Failed to create application')
    } finally {
      setIsUploading(false)
    }
  }

  const isLoading = createMutation.isPending || isUploading

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <FileText className="h-4 w-4" /> },
    { id: "media", label: "Media", icon: <Image className="h-4 w-4" /> },
    { id: "display", label: "Display Rules", icon: <Layout className="h-4 w-4" /> },
    { id: "seo", label: "SEO", icon: <Search className="h-4 w-4" /> },
    { id: "status", label: "Status & Visibility", icon: <Eye className="h-4 w-4" /> }
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
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
          <div className="lg:col-span-8">
            <Card>
              <CardContent className="pt-6">
                <TabLayout
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                >
                  {/* Tab 1: Basic Info */}
                  <TabPanel id="basic" activeTab={activeTab}>
                    <Card>
                      <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>Basic details about this application</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              placeholder="e.g., Home Elevators, Commercial"
                              value={formData.name}
                              onChange={(e) => handleNameChange(e.target.value)}
                            />
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
                  </TabPanel>

                  {/* Tab 2: Media */}
                  <TabPanel id="media" activeTab={activeTab}>
                    <MediaUploadTab
                      thumbnailUrl={formData.thumbnail_image}
                      onThumbnailChange={(file, preview) => {
                        setThumbnailFile(file)
                        setFormData({ ...formData, thumbnail_image: preview })
                      }}
                      thumbnailAlt={formData.image_alt}
                      onThumbnailAltChange={(alt) => setFormData({ ...formData, image_alt: alt })}
                      showBanner={true}
                      bannerUrl={formData.banner_image}
                      onBannerChange={(file, preview) => {
                        setBannerFile(file)
                        setFormData({ ...formData, banner_image: preview })
                      }}
                    />
                  </TabPanel>

                  {/* Tab 3: Display Rules */}
                  <TabPanel id="display" activeTab={activeTab}>
                    <DisplayRulesTab
                      cardPosition={formData.card_position as CardPosition || "image-top"}
                      onCardPositionChange={(position) => setFormData({ ...formData, card_position: position })}
                      sortRule={formData.default_sort as SortRule || "newest"}
                      onSortRuleChange={(rule) => setFormData({ ...formData, default_sort: rule })}
                      manualPriority={formData.sort_order}
                      onManualPriorityChange={(priority) => setFormData({ ...formData, sort_order: priority })}
                    />
                  </TabPanel>

                  {/* Tab 4: SEO */}
                  <TabPanel id="seo" activeTab={activeTab}>
                    <SEOTab
                      metaTitle={formData.meta_title || ""}
                      onMetaTitleChange={(title) => setFormData({ ...formData, meta_title: title })}
                      metaDescription={formData.meta_description || ""}
                      onMetaDescriptionChange={(desc) => setFormData({ ...formData, meta_description: desc })}
                      slug={formData.slug}
                      onSlugChange={(slug) => setFormData({ ...formData, slug })}
                      onAutoGenerate={handleAutoGenerateSEO}
                    />
                  </TabPanel>

                  {/* Tab 5: Status & Visibility */}
                  <TabPanel id="status" activeTab={activeTab}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Visibility Settings</CardTitle>
                        <CardDescription>Control who can see this application</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <Label className="text-base font-medium">Public Visibility</Label>
                              <p className="text-sm text-gray-500 mt-1">
                                Make this application visible to all users
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setFormData({ ...formData, visibility: "public" })}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.visibility === "public"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                  }`}
                              >
                                Public
                              </button>
                              <button
                                onClick={() => setFormData({ ...formData, visibility: "hidden" })}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.visibility === "hidden"
                                    ? "bg-gray-100 text-gray-800 border border-gray-200"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                  }`}
                              >
                                Hidden
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <Label className="text-base font-medium">Active Status</Label>
                              <p className="text-sm text-gray-500 mt-1">
                                Enable or disable this application
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  is_active: e.target.checked,
                                  status: e.target.checked ? 'active' : 'draft'
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabPanel>
                </TabLayout>
              </CardContent>
            </Card>
          </div>

          {/* Right Context Panel */}
          <div className="lg:col-span-4">
            <RightContextPanel
              status={formData.status as "draft" | "active" | "archived"}
              onStatusChange={(status) => setFormData({ ...formData, status })}
              onSave={handleSubmit}
              isSaving={isLoading}
              saveLabel="Create Application"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
