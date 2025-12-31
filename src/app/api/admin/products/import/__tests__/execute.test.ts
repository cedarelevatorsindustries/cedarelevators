/**
 * Integration Tests for CSV Import Execution API
 * Tests the actual import process
 */

import { POST } from '@/app/api/admin/products/import/execute/route'
import { NextRequest } from 'next/server'
import type { ProductGroup } from '@/types/csv-import.types'

// Mock Supabase
const mockInsert = jest.fn()
const mockSelect = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: mockInsert.mockReturnThis(),
      select: mockSelect.mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'product-123', sku: 'CED-TEST-000001' },
        error: null,
      }),
    })),
  })),
}))

// Mock SKU generator
jest.mock('@/lib/utils/sku-generator', () => ({
  generateProductSKU: jest.fn().mockResolvedValue('CED-TEST-000001'),
  generateVariantSKU: jest.fn((productSKU, opt1, opt2) => {
    let sku = productSKU
    if (opt1) sku += `-${opt1.toUpperCase().replace(/[^A-Z0-9]/g, '')}`
    if (opt2) sku += `-${opt2.toUpperCase().replace(/[^A-Z0-9]/g, '')}`
    return sku
  }),
}))

describe('CSV Import Execute API', () => {
  const createMockRequest = (productGroups: ProductGroup[]): NextRequest => {
    return {
      json: async () => ({ productGroups }),
    } as unknown as NextRequest
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockInsert.mockReturnThis()
    mockSelect.mockReturnThis()
  })

  describe('POST /api/admin/products/import/execute', () => {
    it('should reject request without product groups', async () => {
      const request = {
        json: async () => ({}),
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid product groups data')
    })

    it('should reject request with invalid product groups', async () => {
      const request = {
        json: async () => ({ productGroups: 'not-an-array' }),
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
    })

    it('should import single product successfully', async () => {
      const productGroups: ProductGroup[] = [
        {
          title: 'Test Motor',
          slug: 'test-motor',
          short_description: 'A great motor',
          description: 'Detailed description',
          status: 'active',
          price: 5000,
          compare_at_price: 6000,
          track_inventory: true,
          stock_quantity: 100,
          application_slug: 'motors',
          category_slug: 'traction',
          elevator_type_slugs: [],
          collection_slugs: [],
          application_id: 'app-1',
          category_id: 'cat-1',
          elevator_type_ids: [],
          collection_ids: [],
          variants: [
            {
              title: 'Default',
              sku: '',
              price: 5000,
              compare_at_price: 6000,
              stock: 100,
            },
          ],
          errors: [],
          warnings: [],
        },
      ]

      const request = createMockRequest(productGroups)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.productsCreated).toBe(1)
      expect(data.variantsCreated).toBe(1)
    })

    it('should import product with multiple variants', async () => {
      const productGroups: ProductGroup[] = [
        {
          title: 'Test Motor',
          slug: 'test-motor',
          short_description: 'A great motor',
          status: 'active',
          price: 5000,
          compare_at_price: 6000,
          track_inventory: true,
          stock_quantity: 100,
          application_slug: 'motors',
          category_slug: 'traction',
          elevator_type_slugs: [],
          collection_slugs: [],
          application_id: 'app-1',
          category_id: 'cat-1',
          elevator_type_ids: [],
          collection_ids: [],
          variants: [
            {
              title: 'Variant 1',
              sku: '',
              price: 5000,
              compare_at_price: 6000,
              stock: 50,
              option1_name: 'Capacity',
              option1_value: '1000kg',
            },
            {
              title: 'Variant 2',
              sku: '',
              price: 5500,
              compare_at_price: 6500,
              stock: 50,
              option1_name: 'Capacity',
              option1_value: '1500kg',
            },
          ],
          errors: [],
          warnings: [],
        },
      ]

      const request = createMockRequest(productGroups)
      const response = await POST(request)
      const data = await response.json()

      expect(data.productsCreated).toBe(1)
      expect(data.variantsCreated).toBe(2)
    })

    it('should import multiple products', async () => {
      const productGroups: ProductGroup[] = [
        {
          title: 'Motor 1',
          slug: 'motor-1',
          short_description: 'First motor',
          status: 'active',
          price: 5000,
          compare_at_price: 6000,
          track_inventory: true,
          stock_quantity: 100,
          application_slug: 'motors',
          category_slug: 'traction',
          elevator_type_slugs: [],
          collection_slugs: [],
          application_id: 'app-1',
          category_id: 'cat-1',
          elevator_type_ids: [],
          collection_ids: [],
          variants: [{ title: 'Default', sku: '', price: 5000, stock: 100 }],
          errors: [],
          warnings: [],
        },
        {
          title: 'Motor 2',
          slug: 'motor-2',
          short_description: 'Second motor',
          status: 'active',
          price: 7000,
          compare_at_price: 8000,
          track_inventory: true,
          stock_quantity: 50,
          application_slug: 'motors',
          category_slug: 'traction',
          elevator_type_slugs: [],
          collection_slugs: [],
          application_id: 'app-1',
          category_id: 'cat-1',
          elevator_type_ids: [],
          collection_ids: [],
          variants: [{ title: 'Default', sku: '', price: 7000, stock: 50 }],
          errors: [],
          warnings: [],
        },
      ]

      const request = createMockRequest(productGroups)
      const response = await POST(request)
      const data = await response.json()

      expect(data.productsCreated).toBe(2)
      expect(data.variantsCreated).toBe(2)
    })

    it('should handle failed imports gracefully', async () => {
      mockInsert.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      const productGroups: ProductGroup[] = [
        {
          title: 'Test Motor',
          slug: 'test-motor',
          short_description: 'A great motor',
          status: 'active',
          price: 5000,
          compare_at_price: 6000,
          track_inventory: true,
          stock_quantity: 100,
          application_slug: 'motors',
          category_slug: 'traction',
          elevator_type_slugs: [],
          collection_slugs: [],
          application_id: 'app-1',
          category_id: 'cat-1',
          elevator_type_ids: [],
          collection_ids: [],
          variants: [{ title: 'Default', sku: '', price: 5000, stock: 100 }],
          errors: [],
          warnings: [],
        },
      ]

      const request = createMockRequest(productGroups)
      const response = await POST(request)
      const data = await response.json()

      expect(data.failed).toBe(1)
      expect(data.errors).toBeDefined()
      expect(data.errors.length).toBeGreaterThan(0)
    })

    it('should return import duration', async () => {
      const productGroups: ProductGroup[] = [
        {
          title: 'Test Motor',
          slug: 'test-motor',
          short_description: 'A great motor',
          status: 'active',
          price: 5000,
          compare_at_price: 6000,
          track_inventory: true,
          stock_quantity: 100,
          application_slug: 'motors',
          category_slug: 'traction',
          elevator_type_slugs: [],
          collection_slugs: [],
          application_id: 'app-1',
          category_id: 'cat-1',
          elevator_type_ids: [],
          collection_ids: [],
          variants: [{ title: 'Default', sku: '', price: 5000, stock: 100 }],
          errors: [],
          warnings: [],
        },
      ]

      const request = createMockRequest(productGroups)
      const response = await POST(request)
      const data = await response.json()

      expect(data.duration).toBeDefined()
      expect(typeof data.duration).toBe('number')
      expect(data.duration).toBeGreaterThanOrEqual(0)
    })

    it('should set success to false if any errors occurred', async () => {
      mockInsert.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Failed')),
      })

      const productGroups: ProductGroup[] = [
        {
          title: 'Test Motor',
          slug: 'test-motor',
          short_description: 'A great motor',
          status: 'active',
          price: 5000,
          compare_at_price: 6000,
          track_inventory: true,
          stock_quantity: 100,
          application_slug: 'motors',
          category_slug: 'traction',
          elevator_type_slugs: [],
          collection_slugs: [],
          variants: [{ title: 'Default', sku: '', price: 5000, stock: 100 }],
          errors: [],
          warnings: [],
        },
      ]

      const request = createMockRequest(productGroups)
      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(false)
    })
  })
})
