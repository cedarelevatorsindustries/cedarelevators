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
import { Save, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useCollection,
  useUpdateCollection
} from "@/hooks/queries/useCollections"
import type { CollectionStatus, CollectionContextType } from "@/lib/types/collections"
import { generateSlug } from "@/lib/types/collections"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SEOAutoGenerateButton } from "@/components/admin/seo-auto-generate-button"
import { getCategories } from "@/lib/actions/categories"

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
    status: "draft" as CollectionStatus,
    meta_title: "",
    meta_description: "",
    // Context fields
    collection_type: "general" as CollectionContextType,
    category_id: undefined as string | undefined,
    is_business_only: false,
    display_order: 0,
    show_in_guest: true
  })

  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    getCategories().then(result => {
      if (result.success && result.categories) {
        setCategories(result.categories)
      }
    })
  }, [])

  // Load collection data
  useEffect(() => {
    if (collection) {
      setFormData({
        title: collection.title || "",
        slug: collection.slug || "",
        description: collection.description || "",
        // Infer status if not present (backward compatibility)
        status: collection.status || (collection.is_active ? 'active' : 'draft'),
        meta_title: collection.meta_title || "",
        meta_description: collection.meta_description || "",
        // Context fields
        collection_type: collection.collection_type || "general",
        category_id: collection.category_id || undefined,
        is_business_only: collection.is_business_only || false,
        display_order: collection.display_order || 0,
        show_in_guest: collection.show_in_guest ?? true
      })
    }
  }, [collection])



  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.slug) {
        toast.error('Please fill in required fields')
        return
      }

      // Validate category-specific collections have a category selected
      if (formData.collection_type === 'category_specific' && !formData.category_id) {
        toast.error('Please select a category for category-specific collections')
        return
      }

      // Update collection metadata
      const result = await updateMutation.mutateAsync({
        id: params.id,
        data: formData
      })

      if (result.success) {
        toast.success('Collection updated successfully!')
        router.push('/admin/collections')
      }
    } catch (error) {
      console.error('Error updating collection:', error)
      toast.error('Failed to update collection')
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="collection_type">Collection Type</Label>
                    <Select
                      value={formData.collection_type}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          collection_type: value as CollectionContextType,
                          category_id: value === 'category_specific' ? formData.category_id : undefined,
                          is_business_only: value === 'business_specific'
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General (Homepage)</SelectItem>
                        <SelectItem value="category_specific">Category-Specific</SelectItem>
                        <SelectItem value="business_specific">Business Hub</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.collection_type === 'category_specific' && (
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_in_guest">Show to Guest Users</Label>
                  <Checkbox
                    id="show_in_guest"
                    checked={formData.show_in_guest}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_in_guest: checked as boolean })}
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
