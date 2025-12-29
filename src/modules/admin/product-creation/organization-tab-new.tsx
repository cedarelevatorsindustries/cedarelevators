"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Layers, Box, Tag as TagIcon, FolderTree, Check } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { useCategories } from "@/hooks/queries/useCategories"
import { useCollections } from "@/hooks/queries/useCollections"
import { useElevatorTypes } from "@/hooks/queries/useElevatorTypes"
import type { Category } from "@/lib/types/categories"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Cedar Interconnection Logic - Organization Tab
 * 
 * GOLDEN RULE: Products own ALL relationships
 * This tab allows products to assign themselves to:
 * - Application (required)
 * - Category (required, filtered by application)
 * - Subcategory (optional, filtered by category)
 * - Elevator Types (required, multi-select)
 * - Collections (optional, multi-select)
 */

interface OrganizationData {
  application_id?: string
  category_id?: string
  subcategory_id?: string
  elevator_type_ids?: string[]
  collection_ids?: string[]
  
  // Legacy (deprecated)
  categories?: string[]
  collections?: string[]
  tags?: string[]
}

interface OrganizationTabProps {
  organizationData: OrganizationData
  onOrganizationDataChange: (updates: Partial<OrganizationData>) => void
}

export function OrganizationTab({ organizationData, onOrganizationDataChange }: OrganizationTabProps) {
  // Fetch data
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  const { data: collectionsData, isLoading: collectionsLoading } = useCollections()
  const { data: elevatorTypesData, isLoading: elevatorTypesLoading } = useElevatorTypes({ is_active: true })

  const allCategories = categoriesData?.categories || []
  const allCollections = collectionsData?.collections || []
  const allElevatorTypes = elevatorTypesData?.elevatorTypes || []

  // Derive Applications (categories with parent_id = null and not elevator-type)
  const applications = useMemo(
    () => allCategories.filter((c) => !c.parent_id && c.application !== 'elevator-type'),
    [allCategories]
  )

  // Derive Categories (filtered by selected application)
  const categories = useMemo(() => {
    if (!organizationData.application_id) return []
    return allCategories.filter((c) => c.parent_id === organizationData.application_id)
  }, [allCategories, organizationData.application_id])

  // Derive Subcategories (filtered by selected category)
  const subcategories = useMemo(() => {
    if (!organizationData.category_id) return []
    return allCategories.filter((c) => c.parent_id === organizationData.category_id)
  }, [allCategories, organizationData.category_id])

  // Check if uncategorized
  const isUncategorized = useMemo(() => {
    if (!organizationData.application_id || !organizationData.category_id) return false
    const app = applications.find((a) => a.id === organizationData.application_id)
    const cat = allCategories.find((c) => c.id === organizationData.category_id)
    return app?.slug === 'general' && cat?.slug === 'uncategorized'
  }, [organizationData.application_id, organizationData.category_id, applications, allCategories])

  // Auto-select "Uncategorized" if no categories exist
  useEffect(() => {
    if (!categoriesLoading && categories.length === 0 && organizationData.application_id) {
      const generalApp = applications.find((a) => a.slug === 'general')
      const uncategorizedCat = allCategories.find((c) => c.slug === 'uncategorized')
      
      if (generalApp && uncategorizedCat && !organizationData.category_id) {
        onOrganizationDataChange({
          application_id: generalApp.id,
          category_id: uncategorizedCat.id,
        })
      }
    }
  }, [categoriesLoading, categories, organizationData.application_id, organizationData.category_id])

  // Handle Application change
  const handleApplicationChange = (appId: string) => {
    onOrganizationDataChange({
      application_id: appId,
      category_id: undefined, // Reset category
      subcategory_id: undefined, // Reset subcategory
    })
  }

  // Handle Category change
  const handleCategoryChange = (catId: string) => {
    onOrganizationDataChange({
      category_id: catId,
      subcategory_id: undefined, // Reset subcategory
    })
  }

  // Handle Subcategory change
  const handleSubcategoryChange = (subcatId: string | undefined) => {
    onOrganizationDataChange({
      subcategory_id: subcatId,
    })
  }

  // Toggle Elevator Type
  const toggleElevatorType = (elevatorTypeId: string) => {
    const current = organizationData.elevator_type_ids || []
    const isSelected = current.includes(elevatorTypeId)
    const updated = isSelected
      ? current.filter((id) => id !== elevatorTypeId)
      : [...current, elevatorTypeId]

    onOrganizationDataChange({ elevator_type_ids: updated })
  }

  // Toggle Collection
  const toggleCollection = (collectionId: string) => {
    const current = organizationData.collection_ids || []
    const isSelected = current.includes(collectionId)
    const updated = isSelected
      ? current.filter((id) => id !== collectionId)
      : [...current, collectionId]

    onOrganizationDataChange({ collection_ids: updated })
  }

  const isLoading = categoriesLoading || collectionsLoading || elevatorTypesLoading

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Cedar Golden Rule:</strong> Products assign themselves to categories. 
          Select where this product belongs in the hierarchy, what types it applies to, and optional collections.
        </AlertDescription>
      </Alert>

      {/* Product Hierarchy */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-xl font-bold text-gray-900">Product Hierarchy</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Define where this product belongs (Application → Category → Subcategory)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading hierarchy...</div>
          ) : (
            <>
              {/* Application (Required) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="application" className="font-semibold">
                    Application <span className="text-red-500">*</span>
                  </Label>
                  <Badge variant="outline" className="text-xs">Level 1</Badge>
                </div>
                <Select
                  value={organizationData.application_id || ''}
                  onValueChange={handleApplicationChange}
                >
                  <SelectTrigger id="application" className="w-full">
                    <SelectValue placeholder="Select Application (e.g., Erection, Testing, Service)" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Top-level grouping like Erection, Testing, Service, etc.
                </p>
              </div>

              {/* Category (Required) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="category" className="font-semibold">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Badge variant="outline" className="text-xs">Level 2</Badge>
                </div>
                <Select
                  value={organizationData.category_id || ''}
                  onValueChange={handleCategoryChange}
                  disabled={!organizationData.application_id}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue
                      placeholder={
                        organizationData.application_id
                          ? 'Select Category'
                          : 'First select an Application'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No categories available
                      </SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Main product category under selected application (e.g., Motors, Controllers)
                </p>
              </div>

              {/* Subcategory (Optional) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="subcategory" className="font-semibold">
                    Subcategory <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Badge variant="outline" className="text-xs">Level 3</Badge>
                </div>
                <Select
                  value={organizationData.subcategory_id || 'none'}
                  onValueChange={(val) => handleSubcategoryChange(val === 'none' ? undefined : val)}
                  disabled={!organizationData.category_id}
                >
                  <SelectTrigger id="subcategory" className="w-full">
                    <SelectValue
                      placeholder={
                        organizationData.category_id
                          ? 'Select Subcategory (Optional)'
                          : 'First select a Category'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Subcategory</SelectItem>
                    {subcategories.map((subcat) => (
                      <SelectItem key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Specific subcategory for more granular classification (e.g., AC Motors, DC Motors)
                </p>
              </div>

              {/* Uncategorized Warning */}
              {isUncategorized && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    This product is marked as <strong>Uncategorized</strong>. 
                    It will not be visible on the storefront until assigned to a proper category.
                  </AlertDescription>
                </Alert>
              )}

              {/* Hierarchy Preview */}
              {organizationData.application_id && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Hierarchy:</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{applications.find((a) => a.id === organizationData.application_id)?.name}</span>
                    {organizationData.category_id && (
                      <>
                        <span>→</span>
                        <span>{allCategories.find((c) => c.id === organizationData.category_id)?.name}</span>
                      </>
                    )}
                    {organizationData.subcategory_id && (
                      <>
                        <span>→</span>
                        <span>{allCategories.find((c) => c.id === organizationData.subcategory_id)?.name}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Elevator Types */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-xl font-bold text-gray-900">Elevator Types</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Select elevator types this product applies to (Required - Select at least one)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading elevator types...</div>
          ) : allElevatorTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No elevator types available</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {allElevatorTypes.map((type) => {
                const isSelected = (organizationData.elevator_type_ids || []).includes(type.id)
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleElevatorType(type.id)}
                    className={`relative p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-orange-600" />
                      </div>
                    )}
                    <div className="font-medium">{type.name}</div>
                    {type.description && (
                      <div className="text-xs mt-1 opacity-70">{type.description}</div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {(organizationData.elevator_type_ids || []).length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">
                Selected Types ({organizationData.elevator_type_ids?.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {(organizationData.elevator_type_ids || []).map((typeId) => {
                  const type = allElevatorTypes.find((t) => t.id === typeId)
                  return type ? (
                    <Badge key={typeId} variant="secondary" className="bg-orange-100 text-orange-800">
                      {type.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}

          {(!organizationData.elevator_type_ids || organizationData.elevator_type_ids.length === 0) && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Required:</strong> Please select at least one elevator type.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Collections (Optional) */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-xl font-bold text-gray-900">Collections</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Add to curated collections for merchandising (Optional - Select multiple)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading collections...</div>
          ) : allCollections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No collections available. Collections are optional for product organization.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allCollections.map((collection) => {
                const isSelected = (organizationData.collection_ids || []).includes(collection.id)
                return (
                  <button
                    key={collection.id}
                    onClick={() => toggleCollection(collection.id)}
                    className={`relative p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-orange-600" />
                      </div>
                    )}
                    <div className="font-medium">{collection.title}</div>
                    {collection.description && (
                      <div className="text-xs mt-1 opacity-70 line-clamp-2">
                        {collection.description}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {(organizationData.collection_ids || []).length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">
                Selected Collections ({organizationData.collection_ids?.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {(organizationData.collection_ids || []).map((collectionId) => {
                  const collection = allCollections.find((c) => c.id === collectionId)
                  return collection ? (
                    <Badge key={collectionId} variant="secondary">
                      {collection.title}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
