"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowRight, ArrowLeft, FileText, Image, Search, CheckCircle2, AlertCircle, ClipboardCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useCreateCategory, useUpdateCategory, useUpdateSubcategory, useUploadCategoryImage, useCategory, useSubcategory, useCategories, useAllSubcategories, useLinkSubcategory } from "@/hooks/queries/useCategories"
import type { CategoryFormData, CategoryStatus } from "@/lib/types/categories"
import { CategoryPreview } from "./category-preview"
import { CatalogBanner } from "@/modules/catalog/components/catalog-banner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateCategoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('id')
  const parentId = searchParams.get('parent')
  const isEditMode = !!categoryId
  const isSubcategory = !!parentId

  // Fetch data based on whether it's a category or subcategory
  const { data: categoryData, isLoading: isLoadingCategory } = useCategory(isEditMode && !isSubcategory ? categoryId || '' : '')
  const { data: subcategoryData, isLoading: isLoadingSubcategory } = useSubcategory(isEditMode && isSubcategory ? categoryId || '' : '')

  const existingData = isSubcategory ? subcategoryData : categoryData
  const isLoadingExisting = isSubcategory ? isLoadingSubcategory : isLoadingCategory

  const { data: categoriesData } = useCategories()
  const { data: allSubcategoriesData } = useAllSubcategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const updateSubcategoryMutation = useUpdateSubcategory()
  const linkMutation = useLinkSubcategory()
  const uploadMutation = useUploadCategoryImage()

  const [activeTab, setActiveTab] = useState("basic")
  const [creationMode, setCreationMode] = useState<"new" | "existing">("new")
  const [selectedExistingId, setSelectedExistingId] = useState<string>("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    parent_id: parentId || null,
    thumbnail_image: "",
    banner_url: "",
    categories_card_position: "",
    is_active: true,
    status: "draft",
    seo_meta_title: "",
    seo_meta_description: ""
  })

  // Get parent categories for selection
  const parentCategories = categoriesData?.categories?.filter(c => !c.parent_id) || []

  // Load existing data when editing
  useEffect(() => {
    if (isEditMode && existingData?.category) {
      const cat = existingData.category
      setFormData({
        name: cat.name || "",
        slug: cat.slug || cat.handle || "",
        description: cat.description || "",
        parent_id: cat.parent_id || null,
        thumbnail_image: cat.thumbnail || "",
        banner_url: cat.banner_url || "",
        categories_card_position: cat.categories_card_position || "",
        is_active: cat.is_active ?? true,
        status: cat.status || "draft",
        seo_meta_title: cat.seo_meta_title || "",
        seo_meta_description: cat.seo_meta_description || ""
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
    const title = `${formData.name}`
    const description = formData.description || `Explore our ${formData.name} products and solutions.`

    setFormData({
      ...formData,
      seo_meta_title: title.substring(0, 60),
      seo_meta_description: description.substring(0, 160)
    })
    toast.success("SEO fields auto-generated!")
  }

  const handleExistingSelect = (id: string) => {
    setSelectedExistingId(id)
    // Pre-fill form data for preview/context if needed
    const selected = allSubcategoriesData?.subcategories?.find(s => s.id === id)
    if (selected) {
      setFormData({
        ...formData,
        name: selected.title,
        slug: selected.handle,
        description: selected.description || "",
        thumbnail_image: selected.thumbnail || ""
      })
    }
  }

  const handleSubmit = async (isDraft = false) => {
    try {
      if (isSubcategory && creationMode === 'existing' && !selectedExistingId) {
        toast.error('Please select an existing subcategory')
        return
      }

      if (creationMode === 'new' && (!formData.name || !formData.slug)) {
        toast.error('Please fill in required fields')
        return
      }

      setIsUploading(true)

      // Handle "Link Existing" flow for subcategories
      if (isSubcategory && creationMode === 'existing' && parentId) {
        console.log('[Form] Linking existing subcategory:', selectedExistingId, 'to parent:', parentId)
        const result = await linkMutation.mutateAsync({
          category_id: parentId,
          subcategory_id: selectedExistingId
        })

        if (result.success) {
          router.push('/admin/categories')
        }
        return
      }

      // Handle "Create New" flow
      let thumbnailUrl = formData.thumbnail_image
      let bannerUrl = formData.banner_url

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

      const payload: CategoryFormData = {
        ...formData,
        thumbnail_image: thumbnailUrl,
        banner_url: bannerUrl,
        status: (isDraft ? 'draft' : formData.status) as CategoryStatus
      }

      console.log('[Form] Submitting category with payload:', payload)
      console.log('[Form] parent_id value:', payload.parent_id, 'isSubcategory:', isSubcategory)

      // Create or update category/subcategory using the appropriate mutation
      const result = isEditMode
        ? (isSubcategory
          ? await updateSubcategoryMutation.mutateAsync({ id: categoryId!, data: payload as any })
          : await updateMutation.mutateAsync({ id: categoryId!, data: payload as any }))
        : await createMutation.mutateAsync(payload as any)

      if (result.success && result.category) {
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      // Toast is handled by mutation hooks
    } finally {
      setIsUploading(false)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || updateSubcategoryMutation.isPending || linkMutation.isPending || isUploading

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
    if (isSubcategory && creationMode === 'existing') {
      return !!selectedExistingId
    }
    return formData.name && formData.slug
  }

  const isExistingMode = isSubcategory && creationMode === 'existing'

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              {isEditMode
                ? (isSubcategory ? 'Edit Subcategory' : 'Edit Category')
                : (isSubcategory ? 'Create Subcategory' : 'Create Category')}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              {isEditMode
                ? (isSubcategory ? 'Update subcategory details' : 'Update category details')
                : (isSubcategory ? `Add a new subcategory for ${categoriesData?.categories?.find(c => c.id === parentId)?.name || 'parent category'}` : 'Add a new product category')}
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button variant="outline" asChild className="bg-white border-gray-200 hover:bg-gray-50">
              <Link href="/admin/categories">Cancel</Link>
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
              {isLoading
                ? (isSubcategory ? "Publishing Subcategory..." : "Publishing...")
                : (isSubcategory ? "Publish Subcategory" : "Publish")}
            </Button>
          </div>
        </div>

        {/* Progress indicator - Hide in existing mode */}
        {!isExistingMode && (
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
        )}

        {/* Tabs Navigation - Hide in existing mode */}
        {!isExistingMode && (
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
        )}

        {/* Main Content */}
        <div className={activeTab === 'review' ? "max-w-3xl mx-auto w-full space-y-8" : "grid gap-6 lg:gap-8 lg:grid-cols-4 w-full"}>
          <div className={activeTab === 'review' ? "w-full space-y-8" : "lg:col-span-3 min-w-0 w-full space-y-6"}>
            {/* Tab 1: Basic Info */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-1">Step 1: Define Category Identity</h3>
                  <p className="text-sm text-blue-700">Basic information that identifies this category in your catalog</p>
                </div>

                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-white border-b border-gray-200">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      General Information
                      {formData.name.length >= 3 && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>Basic details about this category</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Creation Mode Toggle - ONLY for Creating New Subcategory (not editing) */}
                    {isSubcategory && !isEditMode && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <Label className="mb-3 block text-base">How do you want to add this subcategory?</Label>
                        <Tabs value={creationMode} onValueChange={(v) => setCreationMode(v as any)} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-lg">
                            <TabsTrigger
                              value="new"
                              className="rounded-md data-[state=active]:!bg-orange-600 data-[state=active]:!text-white data-[state=inactive]:text-gray-600"
                            >
                              Create New Subcategory
                            </TabsTrigger>
                            <TabsTrigger
                              value="existing"
                              className="rounded-md data-[state=active]:!bg-orange-600 data-[state=active]:!text-white data-[state=inactive]:text-gray-600"
                            >
                              Select Existing Subcategory
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="existing" className="mt-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-3">
                              <Label>Select from existing subcategories</Label>
                              <Select value={selectedExistingId} onValueChange={handleExistingSelect}>
                                <SelectTrigger className="w-full bg-white">
                                  <SelectValue placeholder="Search or select a subcategory..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  {allSubcategoriesData?.subcategories && allSubcategoriesData.subcategories.length > 0 ? (
                                    allSubcategoriesData.subcategories.map((sub) => (
                                      <SelectItem key={sub.id} value={sub.id}>
                                        <div className="flex items-center justify-between w-full">
                                          <span>{sub.title}</span>
                                          {sub.parent_count && (
                                            <span className="text-xs text-gray-400 ml-2">
                                              (in {sub.parent_count} categories)
                                            </span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-sm text-gray-500 text-center">No existing subcategories found</div>
                                  )}
                                </SelectContent>
                              </Select>
                              <p className="text-sm text-gray-500">
                                Use this if the subcategory is shared across multiple parent categories (e.g., "Safety Devices").
                              </p>
                            </div>
                          </TabsContent>

                          <TabsContent value="new" className="mt-2 text-sm text-gray-500">
                            Fill out the details below to create a brand new subcategory specific to this category.
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}

                    {/* Hide form fields if in 'existing' mode */}
                    {(creationMode === "new" || isEditMode) && (
                      <>
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
                              placeholder="e.g., Motors, Controllers"
                              value={formData.name}
                              onChange={(e) => handleNameChange(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                              {formData.name.length > 0 ? `${formData.name.length} characters` : 'Minimum 3 characters required'}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug <span className="text-red-500">*</span></Label>
                            <Input
                              id="slug"
                              placeholder="auto-generated"
                              value={formData.slug}
                              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">
                              URL: /catalog/categories/{formData.slug || "your-slug"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Brief description of this category..."
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                          />
                          <p className="text-xs text-gray-500">
                            {formData.description?.length || 0} characters • Keep it concise and informative
                          </p>
                        </div>


                        <div className="space-y-2">
                          <Label htmlFor="card_position">Display Order</Label>
                          <Input
                            id="card_position"
                            type="number"
                            min="1"
                            placeholder={`Default: ${(categoriesData?.categories?.length || 0) + 1}`}
                            value={formData.categories_card_position || ''}
                            onChange={(e) => setFormData({ ...formData, categories_card_position: e.target.value })}
                          />
                          <p className="text-xs text-gray-500">
                            Enter a number to set the display order (1, 2, 3...). Leave empty to add at the end.
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab 2: Media */}
            {activeTab === "media" && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-1">Step 2: Add Visual Assets</h3>
                  <p className="text-sm text-blue-700">Upload images that represent this category</p>
                </div>

                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50/100 border-b border-gray-200">
                    <CardTitle>Media Assets</CardTitle>
                    <CardDescription>Upload one thumbnail and one banner image for this category</CardDescription>
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

                    {/* Banner Upload - Only for main categories */}
                    {!isSubcategory && (
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
                                  setFormData({ ...formData, banner_url: reader.result as string })
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                            className="max-w-xs mx-auto"
                          />
                          {formData.banner_url && (
                            <div className="mt-4">
                              <img src={formData.banner_url} alt="Banner preview" className="max-w-full mx-auto rounded-lg" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab 3: SEO */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-1">Step 3: Optimize for Search</h3>
                  <p className="text-sm text-blue-700">Help customers and search engines find this category</p>
                </div>

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
                      <Label htmlFor="meta-title">Meta Title</Label>
                      <Input
                        id="meta-title"
                        placeholder="Category Name - Cedar Elevators"
                        value={formData.seo_meta_title || ""}
                        onChange={(e) => setFormData({ ...formData, seo_meta_title: e.target.value })}
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500">{formData.seo_meta_title?.length || 0}/60 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta-description">Meta Description</Label>
                      <Textarea
                        id="meta-description"
                        placeholder="Brief description for search results..."
                        value={formData.seo_meta_description || ""}
                        onChange={(e) => setFormData({ ...formData, seo_meta_description: e.target.value })}
                        rows={3}
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500">{formData.seo_meta_description?.length || 0}/160 characters</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab 4: Review & Publish */}
            {activeTab === "review" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold text-gray-900">Review Category</h3>
                  <p className="text-gray-500">Preview how your category will look on the storefront and set its status.</p>
                </div>

                {/* Section 1: Thumbnail Preview */}
                <div className="bg-gray-50/50 p-8 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-medium text-center text-gray-700 mb-6">Thumbnail Preview</h4>
                  <div className="flex justify-center">
                    <CategoryPreview
                      name={formData.name}
                      description={formData.description}
                      imageUrl={formData.thumbnail_image}
                      status={formData.status}
                    />
                  </div>
                </div>

                {/* Section 2: Banner Preview - Hide for subcategories */}
                {!isSubcategory && (
                  <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h4 className="text-lg font-medium text-center text-gray-700">Category Banner Preview</h4>
                    </div>
                    <div className="relative">
                      <div className="transform scale-[0.8] origin-top -mb-[20%] md:scale-100 md:mb-0">
                        <CatalogBanner
                          title={formData.name || "Category Name"}
                          subtitle={formData.description}
                          backgroundImage={formData.banner_url || formData.thumbnail_image}
                          type="category"
                          categories={[]}
                          variant="full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-8 md:grid-cols-2">
                  {/* Section 3: Quick Summary */}
                  <Card className="border-gray-200 shadow-sm h-full">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-200 pb-4">
                      <CardTitle className="text-lg">Quick Summary</CardTitle>
                      <CardDescription>Overview of configured settings</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">Category Name</span>
                        <span className="text-sm font-medium">{formData.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">URL Slug</span>
                        <span className="text-sm font-medium text-gray-500 font-mono text-xs">{formData.slug || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">Parent Category</span>
                        <span className="text-sm font-medium">
                          {formData.parent_id ? parentCategories.find(c => c.id === formData.parent_id)?.name : 'Top-level'}
                        </span>
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
                          {formData.seo_meta_title ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <span className="text-gray-400">-</span>}
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
                          <Label>Category Status</Label>
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
                            {formData.status === 'active' ? '🚀 Public on Storefront' : '📝 Hidden from Storefront'}
                          </p>
                          <p className="text-blue-600/80 text-xs">
                            {formData.status === 'active' ? 'Customers can view and filter by this category.' :
                              'Only administrators can see this category.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

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
                      <CategoryPreview
                        name={formData.name}
                        description={formData.description}
                        imageUrl={formData.thumbnail_image}
                        status={formData.status}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4">
          {/* Hide Previous button in existing mode */}
          {!isExistingMode ? (
            <Button
              variant="outline"
              onClick={goToPreviousTab}
              disabled={!canGoPrevious}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
          ) : <div></div>}

          {canGoNext && !isExistingMode ? (
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
              {isLoading ? "Publishing..." : (isExistingMode ? "Link Subcategory" : "Publish Category")}
            </Button>
          )}
        </div>
      </div>
    </div >
  )
}
