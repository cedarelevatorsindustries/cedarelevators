'use server'

import { createAdminClient } from "@/lib/supabase/server"
import { Order } from "@/lib/types/domain"
import { OrderWithDetails } from "@/lib/types/orders"


interface OrderSummary {
  totalOrders: number
  delivered: number
  inTransit: number
  totalSpent: number
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {

  // Fetch from Supabase
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('clerk_user_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as Order[]
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return []
  }
}

export async function getOrderSummary(customerId: string): Promise<OrderSummary> {

  // Fetch from Supabase
  try {
    const supabase = createAdminClient()
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, order_status')
      .eq('clerk_user_id', customerId)

    if (error) throw error

    const summary = (orders || []).reduce((acc, order) => {
      acc.totalOrders += 1
      acc.totalSpent += order.total_amount || 0
      if (order.order_status === 'delivered') acc.delivered += 1
      if (order.order_status === 'shipped' || order.order_status === 'in_transit') acc.inTransit += 1
      return acc
    }, { totalOrders: 0, delivered: 0, inTransit: 0, totalSpent: 0 })

    return summary
  } catch (error) {
    console.error('Error fetching order summary:', error)
    return {
      totalOrders: 0,
      delivered: 0,
      inTransit: 0,
      totalSpent: 0,
    }
  }
}

export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Error fetching order by ID:', error)
      return null
    }

    console.log('Raw order data:', JSON.stringify(data, null, 2))
    console.log('Order items count:', data.order_items?.length || 0)

    // Fetch user and business info if user is logged in
    let userInfo = null
    let businessInfo = null

    if (data.clerk_user_id) {
      // Get user info from users table
      const { data: user } = await supabase
        .from('users')
        .select('id, name, email, phone')
        .eq('clerk_user_id', data.clerk_user_id)
        .single()

      userInfo = user
      console.log('User info:', userInfo)

      // Get business info via business_members -> businesses
      if (userInfo) {
        const { data: businessMember } = await supabase
          .from('business_members')
          .select(`
            business_id,
            businesses!inner (
              id,
              name,
              verification_status
            )
          `)
          .eq('user_id', userInfo.id)
          .single()

        // businesses is returned as object from inner join with single()
        const bizData = businessMember?.businesses as unknown as { id: string; name: string; verification_status: string } | null
        if (bizData) {
          businessInfo = bizData
          console.log('Business info:', businessInfo)
        }
      }
    }

    // Build business profile info for the order
    const businessProfile = businessInfo ? {
      company_name: businessInfo.name || '',
      gst_number: null,
      verification_status: businessInfo.verification_status || 'unverified'
    } : null

    // Map database field names to OrderWithDetails interface
    const orderWithDetails: OrderWithDetails = {
      ...data,
      // Map database fields to interface fields
      subtotal_amount: data.subtotal || 0,
      tax_amount: data.tax || data.gst_amount || 0,
      shipping_amount: data.shipping_cost || 0,
      discount_amount: data.discount || 0,
      // Keep original fields as well
      order_items: data.order_items || [],
      // Override guest name with user info name if available
      guest_name: userInfo?.name || data.guest_name,
      guest_email: userInfo?.email || data.guest_email,
      // Add business profile info
      business_profile: businessProfile
    }

    console.log('Mapped order with details:', JSON.stringify(orderWithDetails, null, 2))

    return orderWithDetails
  } catch (error) {
    console.error('Error fetching order by ID:', error)
    return null
  }
}
