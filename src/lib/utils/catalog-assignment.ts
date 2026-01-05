/**
 * Catalog Assignment Utility
 * Handles assignment of products to catalog structure using junction tables
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ValidationError, CatalogLookupResult } from '@/types/csv-import.types'

// Helper to ensure supabase client is not null
function ensureSupabase(client: ReturnType<typeof createServerSupabaseClient>) {
  if (!client) {
    throw new Error('Failed to create Supabase client')
  }
  return client
}

/**
 * Looks up catalog entity IDs from slugs using new junction table architecture
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
  const supabase = ensureSupabase(createServerSupabaseClient())
  const errors: ValidationError[] = []

  let application_id: string | null = null
  let category_id: string | null = null
  let subcategory_id: string | null = null
  const elevator_type_ids: string[] = []
  const collection_ids: string[] = []

  // 1. Lookup Application (type='application' in categories table)
  const { data: app, error: appError } = await supabase
    .from('categories')
    .select('id, title')
    .eq('slug', applicationSlug)
    .eq('type', 'application')
    .maybeSingle()

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

  // 2. Lookup Category (type='category' in categories table)
  const { data: cat, error: catError } = await supabase
    .from('categories')
    .select('id, title')
    .eq('slug', categorySlug)
    .eq('type', 'category')
    .maybeSingle()

  if (catError || !cat) {
    errors.push({
      row: rowNumber,
      field: 'category_slug',
      message: `Category "${categorySlug}" not found - product will be saved as draft`,
      severity: 'warning'
    })
  } else {
    category_id = cat.id
  }

  // 3. Lookup Subcategory (type='subcategory' in categories table)
  if (subcategorySlug) {
    const { data: subcat, error: subcatError } = await supabase
      .from('categories')
      .select('id, title')
      .eq('slug', subcategorySlug)
      .eq('type', 'subcategory')
      .maybeSingle()

    if (subcatError || !subcat) {
      errors.push({
        row: rowNumber,
        field: 'subcategory_slug',
        message: `Subcategory "${subcategorySlug}" not found`,
        severity: 'warning' // Non-blocking
      })
    } else {
      subcategory_id = subcat.id
    }
  }

  // 4. Lookup Elevator Types (from types table)
  if (elevatorTypeSlugs.length > 0) {
    const { data: types, error: typesError } = await supabase
      .from('types')
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

  // 5. Lookup Collections (from collections table)
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
  // If category is missing, mark as draft
  // Application is optional for draft products
  return !lookupResult.category_id
}
