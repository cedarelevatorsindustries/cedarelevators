/**
 * Unit Tests for Import Fallback Rules
 * Tests fallback logic for missing variant data
 */

import {
  applyVariantFallbacks,
  resolvePricing,
  resolveStock,
  resolveImageUrl,
} from '@/lib/utils/import-fallbacks'
import type { ProductVariant } from '@/types/csv-import.types'

describe('Import Fallback Utilities', () => {
  describe('applyVariantFallbacks', () => {
    const productDefaults = {
      price: 5000,
      compare_at_price: 6000,
      stock: 100,
    }

    it('should use variant values when provided', () => {
      const variant: Partial<ProductVariant> = {
        title: 'Variant 1',
        price: 4500,
        compare_at_price: 5500,
        stock: 50,
        option1_name: 'Capacity',
        option1_value: '1000kg',
      }

      const result = applyVariantFallbacks(variant, productDefaults)

      expect(result.price).toBe(4500)
      expect(result.compare_at_price).toBe(5500)
      expect(result.stock).toBe(50)
    })

    it('should fallback to product values when variant values missing', () => {
      const variant: Partial<ProductVariant> = {
        title: 'Variant 1',
        option1_name: 'Capacity',
        option1_value: '1000kg',
      }

      const result = applyVariantFallbacks(variant, productDefaults)

      expect(result.price).toBe(5000)
      expect(result.compare_at_price).toBe(6000)
      expect(result.stock).toBe(100)
    })

    it('should use "Default" title when not provided', () => {
      const variant: Partial<ProductVariant> = {
        price: 4500,
      }

      const result = applyVariantFallbacks(variant, productDefaults)

      expect(result.title).toBe('Default')
    })

    it('should preserve option values', () => {
      const variant: Partial<ProductVariant> = {
        option1_name: 'Size',
        option1_value: 'Large',
        option2_name: 'Color',
        option2_value: 'Blue',
      }

      const result = applyVariantFallbacks(variant, productDefaults)

      expect(result.option1_name).toBe('Size')
      expect(result.option1_value).toBe('Large')
      expect(result.option2_name).toBe('Color')
      expect(result.option2_value).toBe('Blue')
    })

    it('should preserve attributes', () => {
      const variant: Partial<ProductVariant> = {
        attributes: { voltage: '415V', speed: '1.5 m/s' },
      }

      const result = applyVariantFallbacks(variant, productDefaults)

      expect(result.attributes).toEqual({ voltage: '415V', speed: '1.5 m/s' })
    })

    it('should handle zero values correctly', () => {
      const variant: Partial<ProductVariant> = {
        price: 0,
        stock: 0,
      }

      const result = applyVariantFallbacks(variant, productDefaults)

      expect(result.price).toBe(0) // Zero is valid
      expect(result.stock).toBe(0) // Zero is valid
    })
  })

  describe('resolvePricing', () => {
    it('should return parsed variant price when valid', () => {
      const price = resolvePricing('4500', 5000)
      expect(price).toBe(4500)
    })

    it('should fallback to product price when variant price is undefined', () => {
      const price = resolvePricing(undefined, 5000)
      expect(price).toBe(5000)
    })

    it('should fallback to product price when variant price is empty string', () => {
      const price = resolvePricing('', 5000)
      expect(price).toBe(5000)
    })

    it('should fallback to product price when variant price is whitespace', () => {
      const price = resolvePricing('   ', 5000)
      expect(price).toBe(5000)
    })

    it('should fallback to product price when variant price is invalid', () => {
      const price = resolvePricing('abc', 5000)
      expect(price).toBe(5000)
    })

    it('should handle decimal prices', () => {
      const price = resolvePricing('4599.99', 5000)
      expect(price).toBe(4599.99)
    })

    it('should handle zero price', () => {
      const price = resolvePricing('0', 5000)
      expect(price).toBe(0)
    })

    it('should handle negative price by parsing it', () => {
      const price = resolvePricing('-100', 5000)
      expect(price).toBe(-100) // Parser allows it, business logic should validate
    })
  })

  describe('resolveStock', () => {
    it('should return parsed variant stock when valid', () => {
      const stock = resolveStock('50', 100)
      expect(stock).toBe(50)
    })

    it('should fallback to product stock when variant stock is undefined', () => {
      const stock = resolveStock(undefined, 100)
      expect(stock).toBe(100)
    })

    it('should fallback to product stock when variant stock is empty', () => {
      const stock = resolveStock('', 100)
      expect(stock).toBe(100)
    })

    it('should fallback to product stock when variant stock is invalid', () => {
      const stock = resolveStock('xyz', 100)
      expect(stock).toBe(100)
    })

    it('should handle zero stock', () => {
      const stock = resolveStock('0', 100)
      expect(stock).toBe(0)
    })

    it('should ignore decimal values and parse as integer', () => {
      const stock = resolveStock('50.7', 100)
      expect(stock).toBe(50)
    })

    it('should handle whitespace-only strings', () => {
      const stock = resolveStock('  ', 100)
      expect(stock).toBe(100)
    })
  })

  describe('resolveImageUrl', () => {
    it('should return variant image when provided', () => {
      const url = resolveImageUrl('https://cdn.example.com/variant.jpg', 'https://cdn.example.com/product.jpg')
      expect(url).toBe('https://cdn.example.com/variant.jpg')
    })

    it('should fallback to product image when variant image not provided', () => {
      const url = resolveImageUrl(undefined, 'https://cdn.example.com/product.jpg')
      expect(url).toBe('https://cdn.example.com/product.jpg')
    })

    it('should fallback to product image when variant image is empty', () => {
      const url = resolveImageUrl('', 'https://cdn.example.com/product.jpg')
      expect(url).toBe('https://cdn.example.com/product.jpg')
    })

    it('should fallback to product image when variant image is whitespace', () => {
      const url = resolveImageUrl('   ', 'https://cdn.example.com/product.jpg')
      expect(url).toBe('https://cdn.example.com/product.jpg')
    })

    it('should use placeholder when both images missing', () => {
      const url = resolveImageUrl(undefined, undefined)
      expect(url).toBe('/images/product-placeholder.png')
    })

    it('should use placeholder when both images are empty', () => {
      const url = resolveImageUrl('', '')
      expect(url).toBe('/images/product-placeholder.png')
    })

    it('should use placeholder when product image is whitespace', () => {
      const url = resolveImageUrl(undefined, '  ')
      expect(url).toBe('/images/product-placeholder.png')
    })
  })
})
