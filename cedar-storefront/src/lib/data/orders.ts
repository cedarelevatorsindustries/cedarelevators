'use server'

import { createClerkSupabaseClient } from "@/lib/supabase/server"
import { Order } from "@/lib/types/domain"
import { DEMO_CONFIG } from "./demo/config"

// Import demo data statically for server-side usage
import demoOrdersData from "./demo/demo-orders.json"
const demoOrders = demoOrdersData as Order[]

interface OrderSummary {
  totalOrders: number
  delivered: number
  inTransit: number
  totalSpent: number
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  // 🚀 Demo Mode: Return demo orders
  if (DEMO_CONFIG.USE_DEMO_DATA) {
    return demoOrders
  }

  // Production Mode: Fetch from Supabase
  try {
    const supabase = await createClerkSupabaseClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as Order[]
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return []
  }
}

export async function getOrderSummary(customerId: string): Promise<OrderSummary> {
  // 🚀 Demo Mode: Calculate summary from demo orders
  if (DEMO_CONFIG.USE_DEMO_DATA) {
    const summary = demoOrders.reduce((acc, order) => {
      acc.totalOrders += 1
      acc.totalSpent += order.total || 0
      if (order.status === 'delivered') acc.delivered += 1
      if (order.status === 'shipped' || order.status === 'processing') acc.inTransit += 1
      return acc
    }, { totalOrders: 0, delivered: 0, inTransit: 0, totalSpent: 0 })
    return summary
  }

  // Production Mode: Fetch from Supabase
  try {
    const supabase = await createClerkSupabaseClient()
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total, status')
      .eq('customer_id', customerId)

    if (error) throw error

    const summary = (orders || []).reduce((acc, order) => {
      acc.totalOrders += 1
      acc.totalSpent += order.total || 0
      if (order.status === 'delivered') acc.delivered += 1
      if (order.status === 'shipped' || order.status === 'in_transit') acc.inTransit += 1
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
