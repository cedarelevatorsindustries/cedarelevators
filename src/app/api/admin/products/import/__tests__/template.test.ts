/**
 * Integration Tests for CSV Template API
 * Tests the template generation endpoint
 */

import { GET } from '@/app/api/admin/products/import/template/route'
import { NextResponse } from 'next/server'

describe('CSV Template API', () => {
  describe('GET /api/admin/products/import/template', () => {
    it('should return CSV content with correct headers', async () => {
      const response = await GET()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)

      const text = await response.text()
      expect(text).toContain('product_title')
      expect(text).toContain('short_description')
      expect(text).toContain('application_slug')
      expect(text).toContain('category_slug')
    })

    it('should include all required columns', async () => {
      const response = await GET()
      const text = await response.text()

      const requiredColumns = [
        'product_title',
        'short_description',
        'brief_description',
        'application_slug',
        'category_slug',
        'subcategory_slug',
        'elevator_types',
        'collections',
        'product_price',
        'product_mrp',
        'track_inventory',
        'product_stock',
        'status',
      ]

      requiredColumns.forEach(column => {
        expect(text).toContain(column)
      })
    })

    it('should include variant columns', async () => {
      const response = await GET()
      const text = await response.text()

      const variantColumns = [
        'variant_title',
        'variant_option_1_name',
        'variant_option_1_value',
        'variant_option_2_name',
        'variant_option_2_value',
        'variant_price',
        'variant_mrp',
        'variant_stock',
      ]

      variantColumns.forEach(column => {
        expect(text).toContain(column)
      })
    })

    it('should include attributes column', async () => {
      const response = await GET()
      const text = await response.text()

      expect(text).toContain('attributes')
    })

    it('should include example rows', async () => {
      const response = await GET()
      const text = await response.text()
      const lines = text.split('\n')

      // Should have header + at least 3 example rows
      expect(lines.length).toBeGreaterThan(3)
    })

    it('should have correct Content-Type header', async () => {
      const response = await GET()

      const contentType = response.headers.get('Content-Type')
      expect(contentType).toContain('text/csv')
    })

    it('should have Content-Disposition header for download', async () => {
      const response = await GET()

      const disposition = response.headers.get('Content-Disposition')
      expect(disposition).toContain('attachment')
      expect(disposition).toContain('product-import-template.csv')
    })

    it('should include example data for VVVF Motor', async () => {
      const response = await GET()
      const text = await response.text()

      expect(text).toContain('VVVF Elevator Motor')
    })

    it('should include example with variants', async () => {
      const response = await GET()
      const text = await response.text()
      const lines = text.split('\n')

      // Check if there are multiple rows with same product title (variants)
      const motorRows = lines.filter(line => line.includes('VVVF Elevator Motor'))
      expect(motorRows.length).toBeGreaterThan(1)
    })

    it('should properly escape CSV values with commas', async () => {
      const response = await GET()
      const text = await response.text()

      // Check that values with commas are quoted
      expect(text).toMatch(/"[^"]*,[^"]*"/)
    })
  })
})
