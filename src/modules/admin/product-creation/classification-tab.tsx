"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, FolderTree, Plus, PackageX } from 'lucide-react'
import { getApplications, getCategories, getSubcategories, getElevatorTypes, getCollections } from '@/lib/actions/catalog'
import Link from 'next/link'
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select'

interface ClassificationData {
  application_ids?: string[]
  category_ids?: string[]
  subcategory_ids?: string[]
  elevator_type_ids?: string[]
  collection_ids?: string[]
  // Keep backward compatibility with single IDs
  application_id?: string
  category_id?: string
  subcategory_id?: string
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

  // Load all data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [appsResult, catsResult, typesResult, collectionsResult] = await Promise.all([
          getApplications(),
          getCategories(), // Load all categories
          getElevatorTypes(),
          getCollections()
        ])
        if (appsResult.success && appsResult.data) {
          setApplications(appsResult.data)
        }
        if (catsResult.success && catsResult.data) {
          setCategories(catsResult.data)
        }
        if (typesResult.success && typesResult.data) {
          setElevatorTypes(typesResult.data)
        }
        if (collectionsResult.success && collectionsResult.data) {
          setCollections(collectionsResult.data)
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Load subcategories when categories change
  useEffect(() => {
    const loadSubcategories = async () => {
      const categoryIds = formData.category_ids || []
      if (categoryIds.length === 0) {
        setSubcategories([])
        return
      }
      try {
        // Load subcategories for all selected categories
        const results = await Promise.all(
          categoryIds.map(catId => getSubcategories(catId))
        )
        const allSubcategories: any[] = []
        const seenIds = new Set<string>()
        results.forEach(result => {
          if (result.success && result.data) {
            result.data.forEach((sub: any) => {
              if (!seenIds.has(sub.id)) {
                seenIds.add(sub.id)
                allSubcategories.push(sub)
              }
            })
          }
        })
        setSubcategories(allSubcategories)
      } catch (error) {
        console.error('Error loading subcategories:', error)
      }
    }
    loadSubcategories()
  }, [formData.category_ids])

  const hasClassification =
    (formData.application_ids?.length || 0) > 0 ||
    (formData.category_ids?.length || 0) > 0 ||
    (formData.elevator_type_ids?.length || 0) > 0

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-1">Step 5: Classification (Optional)</h3>
        <p className="text-sm text-blue-700">Define where this product appears in your storefront catalog. Use the search to find and select multiple items.</p>
      </div>

      {/* Info Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">Searchable Multi-Select</h4>
            <p className="text-sm text-amber-700">
              Search and select items from dropdowns. Selected items appear as removable badges. Products can belong to multiple classifications.
            </p>
          </div>
        </div>
      </div>

      {/* Applications */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Applications
            {(formData.application_ids?.length || 0) > 0 && (
              <Badge variant="secondary">{formData.application_ids?.length} selected</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            Select all applications where this product should appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading applications...</p>
          ) : applications.length === 0 ? (
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
            <SearchableMultiSelect
              items={applications}
              selectedIds={formData.application_ids || []}
              onSelectionChange={(ids) => onFormDataChange({ application_ids: ids })}
              placeholder="Search applications..."
              emptyMessage="All applications selected"
            />
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Categories
            {(formData.category_ids?.length || 0) > 0 && (
              <Badge variant="secondary">{formData.category_ids?.length} selected</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            Select all categories where this product should appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading categories...</p>
          ) : categories.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <PackageX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-700 mb-1">No Categories Found</h4>
              <p className="text-sm text-gray-500 mb-4">
                Create a category first
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/categories/create" target="_blank">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Link>
              </Button>
            </div>
          ) : (
            <SearchableMultiSelect
              items={categories}
              selectedIds={formData.category_ids || []}
              onSelectionChange={(ids) => onFormDataChange({ category_ids: ids })}
              placeholder="Search categories..."
              emptyMessage="All categories selected"
            />
          )}
        </CardContent>
      </Card>

      {/* Subcategories */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Subcategories (Optional)
            {(formData.subcategory_ids?.length || 0) > 0 && (
              <Badge variant="outline">{formData.subcategory_ids?.length} selected</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            Select subcategories for finer product organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(formData.category_ids?.length || 0) === 0 ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-500 text-center">Select at least one category first to see available subcategories</p>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-500 text-center">No subcategories available for the selected categories</p>
            </div>
          ) : (
            <SearchableMultiSelect
              items={subcategories}
              selectedIds={formData.subcategory_ids || []}
              onSelectionChange={(ids) => onFormDataChange({ subcategory_ids: ids })}
              placeholder="Search subcategories..."
              emptyMessage="All subcategories selected"
            />
          )}
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
            <SearchableMultiSelect
              items={elevatorTypes}
              selectedIds={formData.elevator_type_ids || []}
              onSelectionChange={(ids) => onFormDataChange({ elevator_type_ids: ids })}
              placeholder="Search elevator types..."
              emptyMessage="All elevator types selected"
            />
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
            <SearchableMultiSelect
              items={collections}
              selectedIds={formData.collection_ids || []}
              onSelectionChange={(ids) => onFormDataChange({ collection_ids: ids })}
              placeholder="Search collections..."
              emptyMessage="All collections selected"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
