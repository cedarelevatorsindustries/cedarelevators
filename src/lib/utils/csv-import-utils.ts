/**
 * CSV Import Utilities
 * Normalization, parsing, and caching for name-based catalog lookups
 */

import type { CatalogLookupMaps, CSVRow, NormalizedCSVRow } from '@/lib/types/csv-import'
import { createAdminClient } from '@/lib/supabase/server'

// =============================================
// NORMALIZATION UTILITIES
// =============================================

/**
 * Normalize a name for lookup (lowercase, trim, collapse spaces)
 */
export function normalizeName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ') // Collapse multiple spaces
}

/**
 * Parse comma-separated names and normalize them
 */
export function parseCommaSeparated(value: string | undefined): string[] {
    if (!value || value.trim() === '') return []

    return value
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
}

/**
 * Parse JSON attributes into an object
 * Example: "{\"power\":\"10HP\",\"voltage\":\"440V\"}" -> { power: "10HP", voltage: "440V" }
 */
export function parseAttributes(value: string | undefined): Record<string, string> {
    if (!value || value.trim() === '') return {}

    try {
        // Try to parse as JSON
        const parsed = JSON.parse(value)
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed
        }
        return {}
    } catch (error) {
        // If JSON parsing fails, return empty object
        console.warn('Failed to parse attributes as JSON:', error)
        return {}
    }
}

/**
 * Parse boolean string
 */
export function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
    if (!value) return defaultValue
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

/**
 * Normalize full CSV row for processing
 */
export function normalizeCSVRow(row: CSVRow): NormalizedCSVRow {
    return {
        ...row,
        _normalized: {
            applications: parseCommaSeparated(row.applications),
            categories: parseCommaSeparated(row.categories),
            subcategories: parseCommaSeparated(row.subcategories),
            types: parseCommaSeparated(row.types),
            collections: parseCommaSeparated(row.collections),
            tags: parseCommaSeparated(row.tags),
            attributes: parseAttributes(row.attributes)
        }
    }
}

// =============================================
// CATALOG LOOKUP MAPS (CACHED)
// =============================================

/**
 * Build in-memory lookup maps for all catalog entities
 * This is done ONCE per import to ensure O(1) lookups
 */
export async function buildCatalogLookupMaps(): Promise<CatalogLookupMaps> {
    const supabase = createAdminClient()

    // Fetch all catalog entities in parallel
    const [applicationsData, categoriesData, subcategoriesData, typesData, collectionsData] = await Promise.all([
        // Applications table
        supabase
            .from('applications')
            .select('id, title'),

        // Categories table
        supabase
            .from('categories')
            .select('id, title'),

        // Subcategories table
        supabase
            .from('subcategories')
            .select('id, title'),

        // Elevator Types table (uses 'name' not 'title')
        supabase
            .from('elevator_types')
            .select('id, name'),

        // Collections table
        supabase
            .from('collections')
            .select('id, title')
    ])

    // Build maps with normalized names as keys
    const maps: CatalogLookupMaps = {
        applications: new Map(),
        categories: new Map(),
        subcategories: new Map(),
        types: new Map(),
        collections: new Map()
    }

    // Populate applications map
    if (applicationsData.data) {
        for (const app of applicationsData.data) {
            const normalized = normalizeName(app.title)
            maps.applications.set(normalized, app.id)
        }
    }

    // Populate categories map
    if (categoriesData.data) {
        for (const cat of categoriesData.data) {
            const normalized = normalizeName(cat.title)
            maps.categories.set(normalized, cat.id)
        }
    }

    // Populate subcategories map
    if (subcategoriesData.data) {
        for (const subcat of subcategoriesData.data) {
            const normalized = normalizeName(subcat.title)
            maps.subcategories.set(normalized, subcat.id)
        }
    }

    // Populate types map (uses 'name' field)
    if (typesData.data) {
        for (const type of typesData.data) {
            const normalized = normalizeName(type.name)
            maps.types.set(normalized, type.id)
        }
    }

    // Populate collections map
    if (collectionsData.data) {
        for (const collection of collectionsData.data) {
            const normalized = normalizeName(collection.title)
            maps.collections.set(normalized, collection.id)
        }
    }

    return maps
}

/**
 * Resolve catalog names to IDs using lookup maps
 */
export function resolveCatalogNames(
    names: string[],
    lookupMap: Map<string, string>,
    entityType: string
): { ids: string[]; missing: string[] } {
    const ids: string[] = []
    const missing: string[] = []

    for (const name of names) {
        const normalized = normalizeName(name)
        const id = lookupMap.get(normalized)

        if (id) {
            ids.push(id)
        } else {
            missing.push(name) // Use original name for error message
        }
    }

    return { ids, missing }
}

// =============================================
// VALIDATION HELPERS
// =============================================

/**
 * Check for duplicate normalized names in catalog entity arrays
 * This helps detect ambiguous references
 */
export function checkForDuplicates(items: Array<{ id: string; name: string }>): string[] {
    const seen = new Map<string, number>()
    const duplicates: string[] = []

    for (const item of items) {
        const normalized = normalizeName(item.name)
        const count = (seen.get(normalized) || 0) + 1
        seen.set(normalized, count)

        if (count === 2) {
            // Only add to duplicates list once
            duplicates.push(item.name)
        }
    }

    return duplicates
}
