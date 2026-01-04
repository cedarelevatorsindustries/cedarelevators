"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, FolderTree, Plus, PackageX } from 'lucide-react'
import { getApplications, getCategories, getSubcategories, getElevatorTypes, getCollections } from '@/lib/actions/catalog'
import Link from 'next/link'

interface ClassificationData {
  application_id?: string
  category_id?: string
  subcategory_id?: string
  elevator_type_ids?: string[]
  collection_ids?: string[]
}

interface ClassificationTabProps {
  formData: ClassificationData
  onFormDataChange: (updates: Partial<ClassificationData>) => void
}

export function ClassificationTab({ formData, onFormDataChange }: ClassificationTabProps) {
  const [applications, setApplications] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [elevatorTypes, setElevatorTypes] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load applications on mount
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const result = await getApplications()
        if (result.success && result.data) {
          setApplications(result.data)
        }
      } catch (error) {
        console.error('Error loading applications:', error)
      }
    }
    loadApplications()
  }, [])

  // Load categories when application changes
  useEffect(() => {
    const loadCategories = async () => {
      if (!formData.application_id) {
        setCategories([])
        return
      }
      try {
        const result = await getCategories(formData.application_id)
        if (result.success && result.data) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [formData.application_id])

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!formData.category_id) {
        setSubcategories([])
        return
      }
      try {
        const result = await getSubcategories(formData.category_id)
        if (result.success && result.data) {
          setSubcategories(result.data)
        }
      } catch (error) {
        console.error('Error loading subcategories:', error)
      }
    }
    loadSubcategories()
  }, [formData.category_id])

  // Load elevator types and collections
  useEffect(() => {
    const loadOptionalData = async () => {
      try {
        const [typesResult, collectionsResult] = await Promise.all([
          getElevatorTypes(),
          getCollections()
        ])
        if (typesResult.success && typesResult.data) {
          setElevatorTypes(typesResult.data)
        }
        if (collectionsResult.success && collectionsResult.data) {
          setCollections(collectionsResult.data)
        }
      } catch (error) {
        console.error('Error loading optional data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOptionalData()
  }, [])

  const toggleElevatorType = (typeId: string) => {
    const current = formData.elevator_type_ids || []
    const updated = current.includes(typeId)
      ? current.filter(id => id !== typeId)
      : [...current, typeId]
    onFormDataChange({ elevator_type_ids: updated })
  }

  const toggleCollection = (collectionId: string) => {
    const current = formData.collection_ids || []
    const updated = current.includes(collectionId)
      ? current.filter(id => id !== collectionId)
      : [...current, collectionId]
    onFormDataChange({ collection_ids: updated })
  }

  const hasClassification = formData.application_id || formData.category_id || (formData.elevator_type_ids?.length || 0) > 0

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-1">Step 5: Classification (Optional)</h3>
        <p className="text-sm text-blue-700">Define where this product appears in your storefront catalog</p>
      </div>

      {/* Info Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">Classification is Optional</h4>
            <p className="text-sm text-amber-700">
              Products can be created without catalog placement. You can add classification later.
              However, unclassified products won't appear in catalog browsing.
            </p>
          </div>
        </div>
      </div>

      {/* Required Classification */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Catalog Placement
            {hasClassification && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription className="text-gray-500">
            Organize your product in the catalog hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Application */}
          <div className="space-y-2">
            <Label htmlFor="application" className="flex items-center gap-2">
              Application
              {formData.application_id && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </Label>

            {applications.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <PackageX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-700 mb-1">No Applications Found</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Create an application first to organize your products
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/applications/create" target="_blank">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Application
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Select
                  value={formData.application_id}
                  onValueChange={(value) => {
                    onFormDataChange({
                      application_id: value,
                      category_id: undefined,
                      subcategory_id: undefined
                    })
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Top-level category (e.g., Passenger Elevators, Freight Elevators)</p>
              </>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              Category
              {formData.category_id && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </Label>

            {!formData.application_id ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-500 text-center">Select an application first</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <PackageX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-700 mb-1">No Categories Found</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Create a category for this application first
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/categories/create" target="_blank">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => {
                    onFormDataChange({
                      category_id: value,
                      subcategory_id: undefined
                    })
                  }}
                  disabled={!formData.application_id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Product category within the application</p>
              </>
            )}
          </div>

          {/* Subcategory */}
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory (Optional)</Label>

            {!formData.category_id ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-500 text-center">Select a category first</p>
              </div>
            ) : subcategories.length === 0 ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-500 text-center">No subcategories available for this category</p>
              </div>
            ) : (
              <>
                <Select
                  value={formData.subcategory_id}
                  onValueChange={(value) => onFormDataChange({ subcategory_id: value })}
                  disabled={!formData.category_id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subcategories.map((subcat) => (
                      <SelectItem key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Further refinement of product category</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Elevator Types */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Elevator Types
            {(formData.elevator_type_ids?.length || 0) > 0 && (
              <Badge variant="secondary">{formData.elevator_type_ids?.length} selected</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            Select all elevator types compatible with this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading elevator types...</p>
          ) : elevatorTypes.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <PackageX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-700 mb-1">No Elevator Types Found</h4>
              <p className="text-sm text-gray-500 mb-4">
                Create elevator types to classify your products
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/elevator-types/create" target="_blank">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Elevator Type
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {elevatorTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={formData.elevator_type_ids?.includes(type.id) || false}
                    onCheckedChange={() => toggleElevatorType(type.id)}
                  />
                  <Label htmlFor={`type-${type.id}`} className="cursor-pointer flex-1">
                    {type.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collections */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Collections (Optional)
            {(formData.collection_ids?.length || 0) > 0 && (
              <Badge variant="outline">{formData.collection_ids?.length} selected</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            Add product to special collections for featured sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading collections...</p>
          ) : collections.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <PackageX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-700 mb-1">No Collections Found</h4>
              <p className="text-sm text-gray-500 mb-4">
                Create collections to feature products in special sections
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/collections/create" target="_blank">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Collection
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {collections.map((collection) => (
                <div key={collection.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={`collection-${collection.id}`}
                    checked={formData.collection_ids?.includes(collection.id) || false}
                    onCheckedChange={() => toggleCollection(collection.id)}
                  />
                  <Label htmlFor={`collection-${collection.id}`} className="cursor-pointer flex-1">
                    {collection.title}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

