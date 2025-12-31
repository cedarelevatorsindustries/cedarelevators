/**
 * Integration Tests for CSV Preview API
 * Tests the preview and validation endpoint
 */

import { POST } from '@/app/api/admin/products/import/preview/route'
import { NextRequest } from 'next/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'test-id', name: 'Test' },
        error: null,
      }),
    })),
  })),
}))

describe('CSV Preview API', () => {
  const createMockRequest = (csvContent: string): NextRequest => {
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    const formData = new FormData()
    formData.append('file', file)

    return {
      formData: async () => formData,
    } as unknown as NextRequest
  }

  describe('POST /api/admin/products/import/preview', () => {
    it('should reject request without file', async () => {
      const formData = new FormData()
      const request = {
        formData: async () => formData,
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('No file provided')
    })

    it('should parse valid CSV successfully', async () => {
      const csv = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Test Motor,A great motor,motors,traction,5000,6000`

      const request = createMockRequest(csv)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should detect missing required columns', async () => {
      const csv = `product_title,short_description
Test Motor,A great motor`

      const request = createMockRequest(csv)
      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.blockingErrors).toBeDefined()
      expect(data.blockingErrors.length).toBeGreaterThan(0)
    })

    it('should validate required fields are not empty', async () => {
      const csv = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
,A great motor,motors,traction,5000,6000`

      const request = createMockRequest(csv)
      const response = await POST(request)
      const data = await response.json()

      expect(data.blockingErrors).toBeDefined()
      const titleError = data.blockingErrors.find((e: any) => e.field === 'product_title')
      expect(titleError).toBeDefined()
    })

    it('should validate price is a positive number', async () => {
      const csv = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Test Motor,A great motor,motors,traction,invalid,6000`

      const request = createMockRequest(csv)
      const response = await POST(request)
      const data = await response.json()

      const priceError = data.blockingErrors.find((e: any) => e.field === 'product_price')
      expect(priceError).toBeDefined()
    })

    it('should group products by title', async () => {
      const csv = `product_title,short_description,application_slug,category_slug,product_price,product_mrp,variant_title
Motor,Great motor,motors,traction,5000,6000,Variant 1
Motor,Great motor,motors,traction,5000,6000,Variant 2`

      const request = createMockRequest(csv)
      const response = await POST(request)
      const data = await response.json()

      expect(data.productGroups).toBeDefined()
      expect(data.productGroups.length).toBe(1)
      expect(data.productGroups[0].variants.length).toBe(2)
    })

    it('should validate JSON in attributes field', async () => {
      const csv = `product_title,short_description,application_slug,category_slug,product_price,product_mrp,attributes
Motor,Great motor,motors,traction,5000,6000,{invalid json}`

      const request = createMockRequest(csv)
      const response = await POST(request)
      const data = await response.json()

      const attrError = data.blockingErrors.find((e: any) => e.field === 'attributes')
      expect(attrError).toBeDefined()
    })

    it('should parse valid JSON attributes', async () => {
      const csv = `product_title,short_description,application_slug,category_slug,product_price,product_mrp,attributes
Motor,Great motor,motors,traction,5000,6000,"{""voltage"":""415V""}"`

      const request = createMockRequest(csv)
      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
    })

    it('should return count of products and variants', async () => {
      const csv = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Motor 1,Great motor,motors,traction,5000,6000
Motor 2,Great motor,motors,traction,5000,6000`

      const request = createMockRequest(csv)
      const response = await POST(request)
      const data = await response.json()

      expect(data.totalProducts).toBe(2)
      expect(data.totalVariants).toBeGreaterThanOrEqual(2)
    })

    it('should separate blocking errors from warnings', async () => {
      const csv = `product_title,short_description,application_slug,category_slug,product_price,product_mrp,variant_price
Motor,Great motor,motors,traction,5000,6000,invalid_price`

      const request = createMockRequest(csv)
      const response = await POST(request)
      const data = await response.json()

      expect(data.warnings).toBeDefined()
      expect(Array.isArray(data.warnings)).toBe(true)
    })
  })
})
