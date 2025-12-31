/**
 * Unit Tests for SKU Generator
 * Tests SKU generation logic for products and variants
 */

import { generateProductSKU, generateVariantSKU, validateSKUUniqueness } from '@/lib/utils/sku-generator'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

describe('SKU Generator Utilities', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('generateProductSKU', () => {
    it('should generate SKU with category code and increment', async () => {
      const sku = await generateProductSKU('traction-motors')
      expect(sku).toMatch(/^CED-[A-Z]{3,4}-\d{6}$/)
    })

    it('should extract category code from category name', async () => {
      const sku = await generateProductSKU('VVVF Motors')
      expect(sku).toContain('VVVF')
    })

    it('should handle category names with special characters', async () => {
      const sku = await generateProductSKU('safety-devices-123')
      expect(sku).toMatch(/^CED-[A-Z]{3,4}-\d{6}$/)
    })

    it('should increment from existing SKUs', async () => {
      mockSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [{ sku: 'CED-MOTOR-000005' }],
          error: null,
        }),
      }))

      const sku = await generateProductSKU('motors')
      expect(sku).toBe('CED-MOTO-000006')
    })

    it('should handle empty category gracefully', async () => {
      const sku = await generateProductSKU('')
      expect(sku).toMatch(/^CED-[A-Z]{3}-\d{6}$/)
    })

    it('should pad category code to minimum 3 characters', async () => {
      const sku = await generateProductSKU('AB')
      expect(sku).toMatch(/^CED-[A-Z]{3}-\d{6}$/)
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }))

      const sku = await generateProductSKU('motors')
      expect(sku).toMatch(/^CED-MOTO-\d{6}$/)
    })
  })

  describe('generateVariantSKU', () => {
    it('should generate variant SKU with product SKU only', () => {
      const sku = generateVariantSKU('CED-MOTOR-000001')
      expect(sku).toBe('CED-MOTOR-000001')
    })

    it('should append option1 value to product SKU', () => {
      const sku = generateVariantSKU('CED-MOTOR-000001', '1000kg')
      expect(sku).toBe('CED-MOTOR-000001-1000KG')
    })

    it('should append both option values to product SKU', () => {
      const sku = generateVariantSKU('CED-MOTOR-000001', '1000kg', '415V')
      expect(sku).toBe('CED-MOTOR-000001-1000KG-415V')
    })

    it('should remove special characters from option values', () => {
      const sku = generateVariantSKU('CED-MOTOR-000001', '1,000 kg', '415-V')
      expect(sku).toBe('CED-MOTOR-000001-1000KG-415V')
    })

    it('should handle empty option values', () => {
      const sku = generateVariantSKU('CED-MOTOR-000001', '', '')
      expect(sku).toBe('CED-MOTOR-000001')
    })

    it('should handle undefined option values', () => {
      const sku = generateVariantSKU('CED-MOTOR-000001', undefined, undefined)
      expect(sku).toBe('CED-MOTOR-000001')
    })

    it('should uppercase option values', () => {
      const sku = generateVariantSKU('CED-MOTOR-000001', 'small', 'blue')
      expect(sku).toBe('CED-MOTOR-000001-SMALL-BLUE')
    })
  })

  describe('validateSKUUniqueness', () => {
    it('should return true if SKU is unique', async () => {
      const isUnique = await validateSKUUniqueness('CED-MOTOR-999999')
      expect(isUnique).toBe(true)
    })

    it('should return false if SKU exists in products table', async () => {
      mockSupabase.from = jest.fn((table: string) => {
        if (table === 'products') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [{ id: '123' }],
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      const isUnique = await validateSKUUniqueness('CED-MOTOR-000001')
      expect(isUnique).toBe(false)
    })

    it('should return false if SKU exists in product_variants table', async () => {
      mockSupabase.from = jest.fn((table: string) => {
        if (table === 'product_variants') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [{ id: '456' }],
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      const isUnique = await validateSKUUniqueness('CED-MOTOR-000001-1000KG')
      expect(isUnique).toBe(false)
    })
  })
})
