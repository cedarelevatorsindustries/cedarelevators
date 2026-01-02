"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, ArrowLeft, LoaderCircle, Layers, FolderTree, FileType, Box, Tag, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCreateCategory, useUploadCategoryImage, useCategories } from "@/hooks/queries/useCategories"
import { NoProductsWarning } from "@/components/admin/NoProductsWarning"
import type { CategoryFormData, CategoryLevel, Category } from "@/lib/types/categories"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SEOAutoGenerateButton } from "@/components/admin/seo-auto-generate-button"

export default function CreateCategoryPage() {
  const router = useRouter()
  const createMutation = useCreateCategory()
  const uploadMutation = useUploadCategoryImage()

  // Steps: 1 = Type Selection, 2 = Details Form
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  // Selection state
  const [creationType, setCreationType] = useState<'application' | 'category' | 'elevator-type'>('application')
  // For 'category' type: distinct mode for Level 2 (Category) vs Level 3 (Subcategory)
  const [categoryMode, setCategoryMode] = useState<'main' | 'sub'>('main')

  // Get existing categories for parent selection
  const { data } = useCategories()
  const allCategories = data?.categories || []

  // Removed: Product selection (products now assign themselves)

  // Derive available parents
  const applications = useMemo(() =>
    allCategories.filter(c => !c.parent_id && c.application !== 'elevator-type'),
    [allCategories]
  )

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    parent_id: null,
    image_url: "",
    image_alt: "",
    icon: "",
    sort_order: 0,
    is_active: true,
    status: "active",
    meta_title: "",
    meta_description: ""
  })

  // Removed: Product selection state (products now assign themselves in their own forms)

  // Temporary state for cascaded selection for subcategory
  const [selectedAppForSubcat, setSelectedAppForSubcat] = useState<string>("")

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

  const handleTypeSelect = (type: 'application' | 'category' | 'elevator-type') => {
    setCreationType(type)
    setFormData(prev => ({
      ...prev,
      parent_id: null
    }))
    setSelectedAppForSubcat("")
    setCurrentStep(2)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error('Please fill in required fields')
        return
      }

      if (creationType === 'category') {
        if (categoryMode === 'main' && !formData.parent_id) {
          toast.error('Please select a Parent Application')
          return
        }
        if (categoryMode === 'sub' && !formData.parent_id) {
          toast.error('Please select a Parent Category')
          return
        }
      }

      // Final data prep
      let finalData = { ...formData }

      if (creationType === 'elevator-type') {
        finalData.parent_id = null
      }

      let imageUrl = formData.image_url

      // Upload image if selected
      if (imageFile) {
        setIsUploading(true)
        const result = await uploadMutation.mutateAsync(imageFile)
        if (result.success && result.url) {
          imageUrl = result.url
        }
        setIsUploading(false)
      }

      // Create category
      const result = await createMutation.mutateAsync({
        ...finalData,
        image_url: imageUrl
      })

      if (result.success && result.category) {
        toast.success('Category created successfully! Products can now assign themselves to this category.')
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
      setIsUploading(false)
    }
  }

  const isLoading = createMutation.isPending || isUploading

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header with Step Indicator */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Create New Item
              </h1>
              <p className="text-gray-600 mt-1">
                Add categories, subcategories, or types to your catalog
              </p>
            </div>
            <Button variant="outline" asChild className="border-gray-300 bg-white">
              <Link href="/admin/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
          </div>

          {/* No Products Warning - Removed (not needed anymore) */}

          {/* Stepper / Tabs */}
          <div className="flex items-center space-x-4 border-b border-gray-200">
            <button
              onClick={() => setCurrentStep(1)}
              className={cn(
                "flex items-center pb-3 px-1 border-b-2 transition-colors text-sm font-medium",
                currentStep === 1
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <span className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs mr-2 relative">
                {currentStep === 1 ? '1' : <Check className="h-3 w-3" />}
                {currentStep === 1 && <span className="absolute inset-0 rounded-full border border-orange-600"></span>}
              </span>
              Select Type
            </button>
            <div className="h-4 w-[1px] bg-gray-300 rotate-12 mb-3"></div>
            <button
              disabled={currentStep === 1}
              className={cn(
                "flex items-center pb-3 px-1 border-b-2 transition-colors text-sm font-medium",
                currentStep === 2
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-400 cursor-not-allowed"
              )}
            >
              <span className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs mr-2">2</span>
              Details Form
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: Type Selection */}
      {currentStep === 1 && (
        <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card
            className="cursor-pointer hover:border-orange-500 hover:shadow-md transition-all group relative overflow-hidden"
            onClick={() => handleTypeSelect('application')}
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-5 w-5 text-orange-500" />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <Layers className="h-6 w-6" />
              </div>
              <CardTitle>Application</CardTitle>
              <CardDescription>
                Top-level grouping like Residential, Commercial, or Industrial.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:border-orange-500 hover:shadow-md transition-all group relative overflow-hidden"
            onClick={() => handleTypeSelect('category')}
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-5 w-5 text-orange-500" />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <Box className="h-6 w-6" />
              </div>
              <CardTitle>Category</CardTitle>
              <CardDescription>
                Main components (Motors, Controllers) or specific subcategories.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:border-orange-500 hover:shadow-md transition-all group relative overflow-hidden"
            onClick={() => handleTypeSelect('elevator-type')}
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-5 w-5 text-orange-500" />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 mb-4">
                <Tag className="h-6 w-6" />
              </div>
              <CardTitle>Elevator Type</CardTitle>
              <CardDescription>
                Technical classification like Traction, MRL, Hydraulic.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* STEP 2: Details Form */}
      {currentStep === 2 && (
        <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-right-4 duration-500">

          {/* Main Form */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
                                    ${creationType === 'application' ? 'bg-blue-100 text-blue-800' :
                      creationType === 'category' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-teal-100 text-teal-800'}`}>
                    {creationType}
                  </span>
                </div>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic details about this {creationType}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Type Specific Hierarchy Selection */}

                {/* Case: Application - Just Name input essentially */}
                {creationType === 'application' && (
                  <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-blue-800">
                    You are creating a top-level <strong>Application</strong>. It will not have a parent.
                  </div>
                )}

                {/* Case: Category - Needs mode selection (Category vs Subcategory) */}
                {creationType === 'category' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                      <Label>Classification</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="catMode"
                            checked={categoryMode === 'main'}
                            onChange={() => {
                              setCategoryMode('main')
                              setFormData(prev => ({ ...prev, parent_id: null }))
                            }}
                            className="text-orange-600"
                          />
                          <span className="text-sm font-medium">Main Category</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="catMode"
                            checked={categoryMode === 'sub'}
                            onChange={() => {
                              setCategoryMode('sub')
                              setFormData(prev => ({ ...prev, parent_id: null }))
                            }}
                            className="text-orange-600"
                          />
                          <span className="text-sm font-medium">Subcategory</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        {categoryMode === 'main'
                          ? "A main category sits directly under an Application (e.g. Residential > Motors)."
                          : "A subcategory sits under a Main Category (e.g. Residential > Motors > AC Motors)."
                        }
                      </p>
                    </div>

                    {categoryMode === 'main' && (
                      <div className="space-y-2">
                        <Label>Parent Application *</Label>
                        <Select
                          value={formData.parent_id || ""}
                          onValueChange={(val) => setFormData({ ...formData, parent_id: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Application" />
                          </SelectTrigger>
                          <SelectContent>
                            {applications.map(app => (
                              <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {categoryMode === 'sub' && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>1. Filter by Application</Label>
                          <Select
                            value={selectedAppForSubcat}
                            onValueChange={(val) => {
                              setSelectedAppForSubcat(val)
                              setFormData({ ...formData, parent_id: null })
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Application" />
                            </SelectTrigger>
                            <SelectContent>
                              {applications.map(app => (
                                <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>2. Select Parent Category *</Label>
                          <Select
                            value={formData.parent_id || ""}
                            onValueChange={(val) => setFormData({ ...formData, parent_id: val })}
                            disabled={!selectedAppForSubcat}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={selectedAppForSubcat ? "Select Category" : "First select App"} />
                            </SelectTrigger>
                            <SelectContent>
                              {allCategories
                                .filter(c => c.parent_id === selectedAppForSubcat)
                                .map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {creationType === 'elevator-type' && (
                  <div className="p-4 bg-teal-50/50 rounded-lg border border-teal-100 text-sm text-teal-800">
                    This creates a standalone <strong>Elevator Type</strong> tag.
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder={creationType === 'elevator-type' ? "e.g., MRL" : "e.g., Motors"}
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                    {creationType === 'application' && (
                      <p className="text-xs text-gray-500">
                        This will auto-fill the Application Group Name
                      </p>
                    )}
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
                    placeholder="Optional description..."
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
                          <img src={imagePreview} className="w-full h-full object-cover" />
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
                <p><strong>Products assign themselves</strong> to categories.</p>
                <p className="text-xs text-blue-700">Once created, products can select this category in their Organization tab.</p>
                <p className="text-xs text-blue-700 pt-2">View assigned products on the category detail page after creation.</p>
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

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}
