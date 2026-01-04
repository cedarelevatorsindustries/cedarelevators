/**
 * Catalog Assignment Utility
 * Handles assignment of products to catalog structure
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ValidationError, CatalogLookupResult } from '@/types/csv-import.types'

/**
 * Looks up catalog entity IDs from slugs
 * Returns null for IDs if not found, and adds validation errors
 */
export async function resolveCatalogReferences(
  applicationSlug: string,
  categorySlug: string,
  subcategorySlug: string | undefined,
  elevatorTypeSlugs: string[],
  collectionSlugs: string[],
  rowNumber: number
): Promise<CatalogLookupResult> {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    throw new Error('Failed to create Supabase client. Check environment variables.')
  }
  const errors: ValidationError[] = []

  let application_id: string | null = null
  let category_id: string | null = null
  let subcategory_id: string | null = null
  const elevator_type_ids: string[] = []
  const collection_ids: string[] = []

  // 1. Lookup Application (parent_id IS NULL in categories table)
  const { data: app, error: appError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', applicationSlug)
    .is('parent_id', null)
    .single()

  if (appError || !app) {
    errors.push({
      row: rowNumber,
      field: 'application_slug',
      message: `Application "${applicationSlug}" not found - product will be saved as draft`,
      severity: 'warning'
    })
  } else {
    application_id = app.id
  }

  // 2. Lookup Category (parent_id = application_id)
  if (application_id) {
    const { data: cat, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', categorySlug)
      .eq('parent_id', application_id)
      .single()

    if (catError || !cat) {
      errors.push({
        row: rowNumber,
        field: 'category_slug',
        message: `Category "${categorySlug}" not found under application "${applicationSlug}" - product will be saved as draft`,
        severity: 'warning'
      })
    } else {
      category_id = cat.id
    }
  } else {
    errors.push({
      row: rowNumber,
      field: 'category_slug',
      message: `Cannot lookup category "${categorySlug}" - application not found. Product will be saved as draft`,
      severity: 'warning'
    })
  }

  // 3. Lookup Subcategory (if provided)
  if (subcategorySlug && category_id) {
    const { data: subcat, error: subcatError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', subcategorySlug)
      .eq('parent_id', category_id)
      .single()

    if (subcatError || !subcat) {
      errors.push({
        row: rowNumber,
        field: 'subcategory_slug',
        message: `Subcategory "${subcategorySlug}" not found under category "${categorySlug}"`,
        severity: 'warning' // Non-blocking
      })
    } else {
      subcategory_id = subcat.id
    }
  }

  // 4. Lookup Elevator Types
  if (elevatorTypeSlugs.length > 0) {
    const { data: types, error: typesError } = await supabase
      .from('elevator_types')
      .select('id, slug')
      .in('slug', elevatorTypeSlugs)

    if (typesError) {
      errors.push({
        row: rowNumber,
        field: 'elevator_types',
        message: `Error looking up elevator types: ${typesError.message}`,
        severity: 'warning'
      })
    } else if (types) {
      elevator_type_ids.push(...types.map(t => t.id))

      // Check for missing slugs
      const foundSlugs = types.map(t => t.slug)
      const missingSlugs = elevatorTypeSlugs.filter(s => !foundSlugs.includes(s))
      if (missingSlugs.length > 0) {
        errors.push({
          row: rowNumber,
          field: 'elevator_types',
          message: `Elevator types not found: ${missingSlugs.join(', ')}`,
          severity: 'warning'
        })
      }
    }
  }

  // 5. Lookup Collections (optional)
  if (collectionSlugs.length > 0) {
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, slug')
      .in('slug', collectionSlugs)

    if (collectionsError) {
      errors.push({
        row: rowNumber,
        field: 'collections',
        message: `Error looking up collections: ${collectionsError.message}`,
        severity: 'warning'
      })
    } else if (collections) {
      collection_ids.push(...collections.map(c => c.id))

      // Check for missing slugs
      const foundSlugs = collections.map(c => c.slug)
      const missingSlugs = collectionSlugs.filter(s => !foundSlugs.includes(s))
      if (missingSlugs.length > 0) {
        errors.push({
          row: rowNumber,
          field: 'collections',
          message: `Collections not found: ${missingSlugs.join(', ')}`,
          severity: 'warning'
        })
      }
    }
  }

  return {
    application_id,
    category_id,
    subcategory_id,
    elevator_type_ids,
    collection_ids,
    errors
  }
}

/**
 * Determines if product should be marked as draft based on catalog assignment failures
 */
export function shouldMarkAsDraft(lookupResult: CatalogLookupResult): boolean {
  // If application or category is missing, mark as draft
  return !lookupResult.application_id || !lookupResult.category_id
}

