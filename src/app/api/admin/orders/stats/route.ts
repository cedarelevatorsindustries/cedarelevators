import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/orders/stats - Fetch order statistics
 * Admin API - Uses Supabase Auth
 */
export async function GET(request: NextRequest) {
    try {
        // Use Supabase auth for admin
        const authSupabase = await createServerSupabase()
        const { data: { user } } = await authSupabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Use admin client to fetch all orders (bypasses RLS)
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('orders')
            .select('order_status, total_amount')

        if (error) {
            console.error('Error fetching order stats:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const stats = data.reduce((acc, order) => {
            acc.total++
            if (order.order_status === 'pending') acc.pending++
            if (order.order_status === 'processing') acc.processing++
            if (order.order_status === 'shipped') acc.shipped++
            if (order.order_status === 'delivered') acc.delivered++
            if (order.order_status === 'cancelled') acc.cancelled++
            acc.totalRevenue += parseFloat(order.total_amount?.toString() || '0')
            return acc
        }, {
            total: 0,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            totalRevenue: 0
        })

        return NextResponse.json({ success: true, stats })
    } catch (error: any) {
        console.error('Error fetching order stats:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch order stats' },
            { status: 500 }
        )
    }
}

