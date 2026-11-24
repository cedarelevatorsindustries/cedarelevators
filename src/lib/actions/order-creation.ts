'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { OrderWithDetails } from '@/lib/types/orders'

interface ShippingAddress {
  name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  email?: string
}

interface CreateOrderInput {
  cartId: string
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  paymentMethod: 'cod' | 'razorpay' | 'upi'
  notes?: string
}

interface CreateOrderResult {
  success: boolean
  order?: OrderWithDetails
  razorpayOrderId?: string
  error?: string
}

/**
 * Create order from cart
 * Phase 1 Scope: Online order placement is deferred in favor of quotation requests.
 */
export async function createOrderFromCart(
  _input: CreateOrderInput
): Promise<CreateOrderResult> {
  return {
    success: false,
    error: 'Online order placement is deferred in Phase 1. Please request a quotation via /quotes/new.'
  }
}

/**
 * Get order by ID with full details
 */
export async function getOrderById(orderId: string): Promise<{
  success: boolean
  order?: OrderWithDetails
  error?: string
}> {
  try {
    const supabase = await createServerSupabase()

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('❌ [Order Fetch] Error:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      order: order as OrderWithDetails
    }
  } catch (error: any) {
    console.error('❌ [Order Fetch] Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<{
  success: boolean
  order?: OrderWithDetails
  error?: string
}> {
  try {
    const supabase = await createServerSupabase()

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_number', orderNumber)
      .single()

    if (error) {
      console.error('❌ [Order Fetch] Error:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      order: order as OrderWithDetails
    }
  } catch (error: any) {
    console.error('❌ [Order Fetch] Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get user orders (backwards compatibility alias)
 */
export async function getUserOrders(userId: string) {
  try {
    const supabase = await createServerSupabase()

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, orders: orders as OrderWithDetails[] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
