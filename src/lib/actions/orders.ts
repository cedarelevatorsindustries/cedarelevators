'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { OrderWithDetails } from '@/lib/types/orders'

// Re-export OrderWithDetails for use in other modules
export type { OrderWithDetails }

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string): Promise<{ success: boolean; order?: OrderWithDetails; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    variant_id,
                    quantity,
                    unit_price,
                    total_price,
                    product_name,
                    variant_name,
                    variant_sku
                )
            `)
            .eq('id', orderId)
            .single()

        if (error) {
            console.error('Error fetching order:', error)
            return { success: false, error: error.message }
        }

        return { success: true, order: data as OrderWithDetails }
    } catch (error: any) {
        console.error('Error in getOrder:', error)
        return { success: false, error: error.message || 'Failed to fetch order' }
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
    orderId: string,
    status: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('orders')
            .update({
                order_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)

        if (error) {
            console.error('Error updating order status:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in updateOrderStatus:', error)
        return { success: false, error: error.message || 'Failed to update order status' }
    }
}

/**
 * Bulk update order status
 */
export async function bulkUpdateOrderStatus(
    orderIds: string[],
    status: string
): Promise<{ success: boolean; updated?: number; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('orders')
            .update({
                order_status: status,
                updated_at: new Date().toISOString()
            })
            .in('id', orderIds)
            .select()

        if (error) {
            console.error('Error bulk updating orders:', error)
            return { success: false, error: error.message }
        }

        return { success: true, updated: data?.length || 0 }
    } catch (error: any) {
        console.error('Error in bulkUpdateOrderStatus:', error)
        return { success: false, error: error.message || 'Failed to bulk update orders' }
    }
}

/**
 * Add tracking information and mark as shipped
 */
export async function addTrackingInfo(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    trackingUrl?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const updateData: any = {
            tracking_number: trackingNumber,
            tracking_carrier: carrier,
            order_status: 'shipped',
            updated_at: new Date().toISOString()
        }

        if (trackingUrl) {
            updateData.tracking_url = trackingUrl
        }

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)

        if (error) {
            console.error('Error adding tracking info:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in addTrackingInfo:', error)
        return { success: false, error: error.message || 'Failed to add tracking information' }
    }
}

/**
 * Cancel order
 */
export async function cancelOrder(
    orderId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('orders')
            .update({
                order_status: 'cancelled',
                cancellation_reason: reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)

        if (error) {
            console.error('Error cancelling order:', error)
            return { success: false, error: error.message }
        }

        // Restore inventory for cancelled order items
        const { data: items } = await supabase
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', orderId)

        if (items) {
            for (const item of items) {
                const { error: invError } = await supabase.rpc('increment_inventory', {
                    product_id: item.product_id,
                    quantity: item.quantity
                })
                
                if (invError) {
                    console.error('Error restoring inventory:', invError)
                    // Continue even if inventory restoration fails
                }
            }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in cancelOrder:', error)
        return { success: false, error: error.message || 'Failed to cancel order' }
    }
}

/**
 * Fetch orders with optional filters
 */
export async function fetchOrders(filters?: {
    status?: string
    paymentStatus?: string
    search?: string
    limit?: number
}): Promise<{ success: boolean; orders?: OrderWithDetails[]; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        let query = supabase
            .from('orders')
            .select(`
        *,
        order_items (
          id,
          product_id,
          variant_id,
          quantity,
          unit_price,
          total_price,
          product_name,
          variant_name,
          variant_sku
        )
      `)
            .order('created_at', { ascending: false })

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('order_status', filters.status)
        }

        if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
            query = query.eq('payment_status', filters.paymentStatus)
        }

        if (filters?.search) {
            query = query.or(`guest_email.ilike.%${filters.search}%,guest_name.ilike.%${filters.search}%`)
        }

        if (filters?.limit) {
            query = query.limit(filters.limit)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching orders:', error)
            return { success: false, error: error.message }
        }

        return { success: true, orders: data as OrderWithDetails[] }
    } catch (error: any) {
        console.error('Error in fetchOrders:', error)
        return { success: false, error: error.message || 'Failed to fetch orders' }
    }
}
