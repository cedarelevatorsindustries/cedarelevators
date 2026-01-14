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

    return data as OrderWithDetails
  } catch (error) {
    console.error('Error fetching order by ID:', error)
    return null
  }
}
