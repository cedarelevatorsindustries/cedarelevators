/**
 * Unit Tests for Catalog Assignment
 * Tests catalog reference resolution logic
 */

import { resolveCatalogReferences, shouldMarkAsDraft } from '@/lib/utils/catalog-assignment'
import { createClient } from '@/lib/supabase/server'
import type { CatalogLookupResult } from '@/types/csv-import.types'

jest.mock('@/lib/supabase/server')

describe('Catalog Assignment Utilities', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('resolveCatalogReferences', () => {
    it('should resolve all catalog references successfully', async () => {
      mockSupabase.from = jest.fn((table: string) => {
        if (table === 'categories') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockResolvedValue({
              data: { id: 'app-1', name: 'Motors' },
              error: null,
            }),
          }
        }
        if (table === 'elevator_types') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
              data: [{ id: 'type-1', slug: 'passenger' }],
              error: null,
            }),
          }
        }
        if (table === 'collections') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
              data: [{ id: 'col-1', slug: 'featured' }],
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }
      })

      const result = await resolveCatalogReferences(
        'motors',
        'traction-motors',
        undefined,
        ['passenger'],
        ['featured'],
        2
      )

      expect(result.errors.length).toBeGreaterThanOrEqual(0)
    })

    it('should add error when application not found', async () => {
      mockSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }))

      const result = await resolveCatalogReferences('invalid-app', 'category', undefined, [], [], 2)

      expect(result.application_id).toBeNull()
      expect(result.errors.some(e => e.field === 'application_slug')).toBe(true)
    })

    it('should add error when category not found', async () => {
      mockSupabase.from = jest.fn((table: string) => {
        if (table === 'categories') {
          const isCall = jest.fn()
          const singleCall = jest.fn()

          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            is: jest.fn(() => {
              isCall()
              return {
                single: () => {
                  singleCall()
                  // First call returns application
                  if (isCall.mock.calls.length === 1) {
                    return Promise.resolve({ data: { id: 'app-1' }, error: null })
                  }
                  // Second call returns no category
                  return Promise.resolve({ data: null, error: { message: 'Not found' } })
                },
              }
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      const result = await resolveCatalogReferences('motors', 'invalid-category', undefined, [], [], 2)

      expect(result.errors.some(e => e.field === 'category_slug')).toBe(true)
    })

    it('should add warning for missing subcategory', async () => {
      mockSupabase.from = jest.fn((table: string) => {
        if (table === 'categories') {
          let callCount = 0
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            single: jest.fn(() => {
              callCount++
              if (callCount === 1) {
                // Application found
                return Promise.resolve({ data: { id: 'app-1' }, error: null })
              } else if (callCount === 2) {
                // Category found
                return Promise.resolve({ data: { id: 'cat-1' }, error: null })
              } else {
                // Subcategory not found
                return Promise.resolve({ data: null, error: { message: 'Not found' } })
              }
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      const result = await resolveCatalogReferences(
        'motors',
        'traction',
        'invalid-subcat',
        [],
        [],
        2
      )

      const hasSubcategoryWarning = result.errors.some(
        e => e.field === 'subcategory_slug' && e.severity === 'warning'
      )
      expect(hasSubcategoryWarning).toBe(true)
    })

    it('should handle missing elevator types gracefully', async () => {
      mockSupabase.from = jest.fn((table: string) => {
        if (table === 'categories') {
          let callCount = 0
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            single: jest.fn(() => {
              callCount++
              if (callCount <= 2) {
                return Promise.resolve({ data: { id: `id-${callCount}` }, error: null })
              }
              return Promise.resolve({ data: null, error: null })
            }),
          }
        }
        if (table === 'elevator_types') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
              data: [], // No types found
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      const result = await resolveCatalogReferences(
        'motors',
        'traction',
        undefined,
        ['passenger', 'commercial'],
        [],
        2
      )

      expect(result.elevator_type_ids).toEqual([])
      expect(result.errors.some(e => e.field === 'elevator_types')).toBe(true)
    })
  })

  describe('shouldMarkAsDraft', () => {
    it('should return true when application is missing', () => {
      const lookupResult: CatalogLookupResult = {
        application_id: null,
        category_id: 'cat-1',
        subcategory_id: null,
        elevator_type_ids: [],
        collection_ids: [],
        errors: [],
      }

      expect(shouldMarkAsDraft(lookupResult)).toBe(true)
    })

    it('should return true when category is missing', () => {
      const lookupResult: CatalogLookupResult = {
        application_id: 'app-1',
        category_id: null,
        subcategory_id: null,
        elevator_type_ids: [],
        collection_ids: [],
        errors: [],
      }

      expect(shouldMarkAsDraft(lookupResult)).toBe(true)
    })

    it('should return true when both application and category are missing', () => {
      const lookupResult: CatalogLookupResult = {
        application_id: null,
        category_id: null,
        subcategory_id: null,
        elevator_type_ids: [],
        collection_ids: [],
        errors: [],
      }

      expect(shouldMarkAsDraft(lookupResult)).toBe(true)
    })

    it('should return false when both application and category exist', () => {
      const lookupResult: CatalogLookupResult = {
        application_id: 'app-1',
        category_id: 'cat-1',
        subcategory_id: null,
        elevator_type_ids: [],
        collection_ids: [],
        errors: [],
      }

      expect(shouldMarkAsDraft(lookupResult)).toBe(false)
    })

    it('should not be affected by missing subcategory', () => {
      const lookupResult: CatalogLookupResult = {
        application_id: 'app-1',
        category_id: 'cat-1',
        subcategory_id: null,
        elevator_type_ids: [],
        collection_ids: [],
        errors: [],
      }

      expect(shouldMarkAsDraft(lookupResult)).toBe(false)
    })

    it('should not be affected by missing elevator types or collections', () => {
      const lookupResult: CatalogLookupResult = {
        application_id: 'app-1',
        category_id: 'cat-1',
        subcategory_id: 'subcat-1',
        elevator_type_ids: [],
        collection_ids: [],
        errors: [],
      }

      expect(shouldMarkAsDraft(lookupResult)).toBe(false)
    })
  })
})
