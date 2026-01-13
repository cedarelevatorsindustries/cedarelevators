"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, ArrowLeft, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCollection, useUpdateCollection } from "@/hooks/queries/useCollections"
import type { CollectionFormData, CollectionContextType } from "@/lib/types/collections"
import { generateSlug } from "@/lib/types/collections"
import { toast } from "sonner"
import { SEOAutoGenerateButton } from "@/components/admin/seo-auto-generate-button"
import { getCategories } from "@/lib/actions/categories"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditCollectionPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: collectionData, isLoading: isLoadingCollection } = useCollection(resolvedParams.id)
  const updateMutation = useUpdateCollection()

  const collection = collectionData?.collection

  const [formData, setFormData] = useState<CollectionFormData>({
    title: "",
    slug: "",
    description: "",
    is_active: true,
    meta_title: "",
    meta_description: "",
    collection_type: "general",
    category_id: undefined,
    display_order: 0,
    show_in_guest: true,
    is_business_only: false,
    status: 'draft',
  })

  const [categories, setCategories] = useState<any[]>([])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategories()
        if (result.success && result.categories) {
          setCategories(result.categories)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Prefill form data when collection loads
  useEffect(() => {
    if (collection) {
      setFormData({
        title: collection.title || "",
        slug: collection.slug || "",
        description: collection.description || "",
        meta_title: collection.meta_title || "",
        meta_description: collection.meta_description || "",
        collection_type: collection.collection_type || "general",
        category_id: collection.category_id || undefined,
        is_business_only: collection.is_business_only || false,
        display_order: collection.display_order || 0,
        show_in_guest: collection.show_in_guest ?? true,
        status: collection.status || (collection.is_active ? 'active' : 'draft'),
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

      // No validation needed for category_specific collections

      const result = await updateMutation.mutateAsync({
        id: resolvedParams.id,
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
        <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const isLoading = updateMutation.isPending

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Edit Collection
            </h1>
            <p className="text-gray-600 mt-1">
              Update collection details
            </p>
          </div>
          <Button variant="outline" asChild className="border-gray-300 bg-white">
            <Link href="/admin/collections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>

        {/* Main Form - Single Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Collection details and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Collection Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Summer Sale, Best Sellers"
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
                  placeholder="Describe this collection..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Collection Context */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Context</CardTitle>
              <CardDescription>Define where and how this collection appears</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="collection_type">Collection Context *</Label>
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
                <p className="text-xs text-gray-500">
                  {formData.collection_type === 'general' && 'Shows on homepage for all users'}
                  {formData.collection_type === 'category_specific' && 'Shows in Categories tab between Shop by Categories and Shop by Elevator Type'}
                  {formData.collection_type === 'business_specific' && 'Shows in business hub only'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Control visibility and ordering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500">
                  Lower numbers appear first. Use 0 for default ordering.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_in_guest">Show to Guest Users</Label>
                  <p className="text-xs text-gray-500">
                    Display this collection on guest user homepage
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="show_in_guest"
                  checked={formData.show_in_guest}
                  onChange={(e) => setFormData({ ...formData, show_in_guest: e.target.checked })}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </div>

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
                <p className="text-xs text-gray-500">
                  Controls visibility of the collection
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SEO</CardTitle>
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
              <CardDescription>Search engine optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title || ""}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="SEO title for search engines"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description || ""}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={3}
                  placeholder="SEO description for search engines"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              asChild
            >
              <Link href="/admin/collections">Cancel</Link>
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
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
      </div>
    </div>
  )
}
