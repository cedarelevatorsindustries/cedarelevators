/**
 * Unit Tests for SEO Generator
 * Tests SEO metadata generation for products
 */

import {
  generateSlug,
  generateMetaTitle,
  generateMetaDescription,
  generateOGImage,
} from '@/lib/utils/seo-generator'

describe('SEO Generator Utilities', () => {
  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      const slug = generateSlug('VVVF Elevator Motor')
      expect(slug).toBe('vvvf-elevator-motor')
    })

    it('should replace spaces with hyphens', () => {
      const slug = generateSlug('High Speed Motor')
      expect(slug).toBe('high-speed-motor')
    })

    it('should remove special characters', () => {
      const slug = generateSlug('Motor @ 415V (Premium)')
      expect(slug).toBe('motor-415v-premium')
    })

    it('should remove leading and trailing hyphens', () => {
      const slug = generateSlug('  Motor Title  ')
      expect(slug).not.toMatch(/^-|-$/)
    })

    it('should handle multiple consecutive spaces', () => {
      const slug = generateSlug('Motor    With    Spaces')
      expect(slug).toBe('motor-with-spaces')
    })

    it('should limit length to 100 characters', () => {
      const longTitle = 'a'.repeat(150)
      const slug = generateSlug(longTitle)
      expect(slug.length).toBeLessThanOrEqual(100)
    })

    it('should handle empty string', () => {
      const slug = generateSlug('')
      expect(slug).toBe('')
    })

    it('should handle numbers in title', () => {
      const slug = generateSlug('Motor 1000kg 415V')
      expect(slug).toBe('motor-1000kg-415v')
    })
  })

  describe('generateMetaTitle', () => {
    it('should append brand suffix', () => {
      const title = generateMetaTitle('VVVF Motor')
      expect(title).toContain('Cedar Elevator Components')
    })

    it('should limit total length to 60 characters', () => {
      const longTitle = 'A'.repeat(100)
      const title = generateMetaTitle(longTitle)
      expect(title.length).toBeLessThanOrEqual(60)
    })

    it('should add ellipsis when truncating', () => {
      const longTitle = 'Very Long Product Title That Exceeds Maximum Length'
      const title = generateMetaTitle(longTitle)
      if (title.length === 60) {
        expect(title).toContain('...')
      }
    })

    it('should preserve short titles', () => {
      const shortTitle = 'Motor'
      const title = generateMetaTitle(shortTitle)
      expect(title).toBe('Motor | Cedar Elevator Components')
    })

    it('should handle empty title', () => {
      const title = generateMetaTitle('')
      expect(title).toContain('Cedar Elevator Components')
    })
  })

  describe('generateMetaDescription', () => {
    it('should start with "Buy" and product title', () => {
      const desc = generateMetaDescription('VVVF Motor')
      expect(desc).toMatch(/^Buy VVVF Motor/)
    })

    it('should include application name when provided', () => {
      const desc = generateMetaDescription('Motor', 'passenger elevators')
      expect(desc).toContain('for passenger elevators')
    })

    it('should include elevator types when provided', () => {
      const desc = generateMetaDescription('Motor', undefined, ['passenger', 'commercial'])
      expect(desc).toContain('passenger, commercial')
    })

    it('should include both application and elevator types', () => {
      const desc = generateMetaDescription('Motor', 'elevators', ['passenger', 'freight'])
      expect(desc).toContain('for elevators')
      expect(desc).toContain('passenger, freight')
    })

    it('should limit to 3 elevator types', () => {
      const types = ['passenger', 'commercial', 'freight', 'residential', 'industrial']
      const desc = generateMetaDescription('Motor', undefined, types)
      const matches = desc.match(/passenger|commercial|freight|residential|industrial/g)
      expect(matches?.length).toBeLessThanOrEqual(3)
    })

    it('should limit total length to 160 characters', () => {
      const longTitle = 'A'.repeat(100)
      const desc = generateMetaDescription(longTitle)
      expect(desc.length).toBeLessThanOrEqual(160)
    })

    it('should add ellipsis when truncating', () => {
      const longTitle = 'Very Long Product Title That Will Definitely Exceed The Maximum Description Length Allowed'
      const desc = generateMetaDescription(longTitle, 'application', ['type1', 'type2', 'type3'])
      if (desc.length === 160) {
        expect(desc).toContain('...')
      }
    })

    it('should include brand mention', () => {
      const desc = generateMetaDescription('Motor')
      expect(desc).toContain('Cedar Elevator Industries')
    })
  })

  describe('generateOGImage', () => {
    it('should return provided image URL', () => {
      const imageUrl = generateOGImage('https://example.com/image.jpg')
      expect(imageUrl).toBe('https://example.com/image.jpg')
    })

    it('should return placeholder when no image provided', () => {
      const imageUrl = generateOGImage()
      expect(imageUrl).toBe('/images/product-placeholder.png')
    })

    it('should return placeholder for empty string', () => {
      const imageUrl = generateOGImage('')
      expect(imageUrl).toBe('/images/product-placeholder.png')
    })

    it('should return placeholder for undefined', () => {
      const imageUrl = generateOGImage(undefined)
      expect(imageUrl).toBe('/images/product-placeholder.png')
    })
  })
})
