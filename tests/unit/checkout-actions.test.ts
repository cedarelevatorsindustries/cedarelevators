/**
 * Unit Tests for Checkout Actions
 * Tests all server actions in /src/lib/actions/checkout.ts
 */

import {
  checkCheckoutEligibility,
  getBusinessAddresses,
  addBusinessAddress,
  updateBusinessAddress,
  deleteBusinessAddress,
  getCheckoutSummary,
  createOrderFromCart,
  getOrderById,
  type BusinessAddress,
  type CheckoutSummary
} from '@/lib/actions/checkout'

import { createServerSupabase } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

// Mock modules
jest.mock('@/lib/supabase/server')
jest.mock('@clerk/nextjs/server')

describe('Checkout Actions - Unit Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkCheckoutEligibility', () => {
    
    it('should return not authenticated when user is not signed in', async () => {
      // Mock auth to return no user
      (auth as jest.Mock).mockResolvedValue({ userId: null })

      const result = await checkCheckoutEligibility('cart_123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
      expect(result.data?.eligible).toBe(false)
      expect(result.data?.reason).toBe('not_authenticated')
    })

    it('should call database function with correct parameters', async () => {
      const mockRpc = jest.fn().mockResolvedValue({
        data: { eligible: true },
        error: null
      })

      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })
      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        rpc: mockRpc
      })

      await checkCheckoutEligibility('cart_456')

      expect(mockRpc).toHaveBeenCalledWith('validate_checkout_eligibility', {
        p_cart_id: 'cart_456',
        p_clerk_user_id: 'user_123'
      })
    })

    it('should return eligibility data on success', async () => {
      const mockEligibility = {
        eligible: true,
        business_id: 'business_789',
        verification_status: 'verified'
      }

      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })
      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        rpc: jest.fn().mockResolvedValue({
          data: mockEligibility,
          error: null
        })
      })

      const result = await checkCheckoutEligibility('cart_123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockEligibility)
    })

    it('should handle database errors gracefully', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })
      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        rpc: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        })
      })

      const result = await checkCheckoutEligibility('cart_123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      expect(result.data?.eligible).toBe(false)
    })
  })

  describe('getBusinessAddresses', () => {
    
    it('should return empty array when no addresses exist', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })
      
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })
      })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: jest.fn().mockReturnValue({
          select: mockSelect
        })
      })

      const result = await getBusinessAddresses()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('should return addresses ordered by default and created_at', async () => {
      const mockAddresses = [
        { id: 'addr_1', is_default: true, created_at: '2024-01-01' },
        { id: 'addr_2', is_default: false, created_at: '2024-01-02' }
      ]

      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })
      
      const mockOrder2 = jest.fn().mockResolvedValue({
        data: mockAddresses,
        error: null
      })

      const mockOrder1 = jest.fn().mockReturnValue({
        order: mockOrder2
      })

      const mockEq2 = jest.fn().mockReturnValue({
        order: mockOrder1
      })

      const mockEq1 = jest.fn().mockReturnValue({
        eq: mockEq2
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq1
      })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: jest.fn().mockReturnValue({
          select: mockSelect
        })
      })

      const result = await getBusinessAddresses()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('should require authentication', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null })

      const result = await getBusinessAddresses()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
    })
  })

  describe('addBusinessAddress', () => {
    
    it('should sanitize input to prevent XSS', async () => {
      const maliciousAddress: BusinessAddress = {
        business_id: 'business_123',
        address_type: 'shipping',
        contact_name: '<script>alert("xss")</script>John Doe',
        contact_phone: '9876543210',
        address_line1: 'Test <> Address',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400001'
      }

      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'addr_new' },
            error: null
          })
        })
      })

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: {},
            error: null
          })
        })
      })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: jest.fn().mockReturnValue({
          update: mockUpdate,
          insert: mockInsert
        })
      })

      const result = await addBusinessAddress(maliciousAddress)

      // Verify sanitization occurred (< and > should be removed)
      expect(mockInsert).toHaveBeenCalled()
      const insertedData = mockInsert.mock.calls[0][0]
      expect(insertedData.contact_name).not.toContain('<')
      expect(insertedData.contact_name).not.toContain('>')
    })

    it('should validate UUID format for business_id', async () => {
      const invalidAddress: BusinessAddress = {
        business_id: 'invalid-uuid',
        address_type: 'shipping',
        contact_name: 'John Doe',
        contact_phone: '9876543210',
        address_line1: 'Test Address',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400001'
      }

      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

      const result = await addBusinessAddress(invalidAddress)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid business ID')
    })

    it('should unset other defaults when adding default address', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'
      const defaultAddress: BusinessAddress = {
        business_id: validUUID,
        address_type: 'shipping',
        contact_name: 'John Doe',
        contact_phone: '9876543210',
        address_line1: 'Test Address',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400001',
        is_default: true
      }

      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: {},
            error: null
          })
        })
      })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'addr_new' },
            error: null
          })
        })
      })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: jest.fn().mockReturnValue({
          update: mockUpdate,
          insert: mockInsert
        })
      })

      await addBusinessAddress(defaultAddress)

      // Verify update was called to unset other defaults
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockUpdate.mock.calls[0][0]).toEqual({ is_default: false })
    })
  })

  describe('getCheckoutSummary', () => {
    
    it('should calculate correct pricing with GST', async () => {
      const mockCartItems = [
        {
          id: 'item_1',
          quantity: 2,
          products: { price: 10000 }
        },
        {
          id: 'item_2',
          quantity: 1,
          products: { price: 5000 }
        }
      ]

      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockCartItems,
          error: null
        })
      })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: jest.fn().mockReturnValue({
          select: mockSelect
        })
      })

      const result = await getCheckoutSummary('cart_123')

      expect(result.success).toBe(true)
      expect(result.data?.subtotal).toBe(25000) // (2*10000 + 1*5000)
      expect(result.data?.gst_percentage).toBe(18)
      expect(result.data?.tax).toBe(4500) // 18% of 25000
      expect(result.data?.shipping).toBe(0)
      expect(result.data?.total).toBe(29500) // 25000 + 4500
    })

    it('should handle empty cart', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      })

      const result = await getCheckoutSummary('cart_123')

      expect(result.success).toBe(true)
      expect(result.data?.subtotal).toBe(0)
      expect(result.data?.total).toBe(0)
    })
  })

  describe('createOrderFromCart', () => {
    
    it('should require authentication', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null })

      const result = await createOrderFromCart('cart_123', 'addr_1', 'addr_2')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
    })

    it('should verify business verification status', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'business_123',
              verification_status: 'pending'
            },
            error: null
          })
        })
      })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: jest.fn().mockReturnValue({
          select: mockSelect
        })
      })

      const result = await createOrderFromCart('cart_123', 'addr_1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('verification required')
    })

    it('should validate cart ownership', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

      let callCount = 0
      const mockFrom = jest.fn((table: string) => {
        callCount++
        if (callCount === 1) {
          // First call for business_profiles
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'business_123', verification_status: 'verified' },
                  error: null
                })
              })
            })
          }
        } else if (callCount === 2) {
          // Second call for carts - return error (not found)
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Cart not found' }
                  })
                })
              })
            })
          }
        }
      })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: mockFrom
      })

      const result = await createOrderFromCart('cart_123', 'addr_1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cart not found')
    })
  })

  describe('getOrderById', () => {
    
    it('should fetch order with items', async () => {
      const mockOrder = {
        id: 'order_123',
        order_number: 'ORD-001',
        total_amount: 50000,
        order_items: [
          { id: 'item_1', product_name: 'Product 1', quantity: 2 }
        ]
      }

      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockOrder,
        error: null
      })

      const mockEq2 = jest.fn().mockReturnValue({
        single: mockSingle
      })

      const mockEq1 = jest.fn().mockReturnValue({
        eq: mockEq2
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq1
      })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: jest.fn().mockReturnValue({
          select: mockSelect
        })
      })

      const result = await getOrderById('order_123')

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('order_123')
      expect(result.data?.order_items).toHaveLength(1)
    })

    it('should return error when order not found', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null
      })

      ;(createServerSupabase as jest.Mock).mockResolvedValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: mockSingle
              })
            })
          })
        })
      })

      const result = await getOrderById('order_999')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Order not found')
    })
  })
})
