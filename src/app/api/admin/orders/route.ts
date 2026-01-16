import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { fetchOrders } from '@/lib/actions/orders'

/**
 * GET /api/admin/orders - Fetch orders with filters
 * Admin API - Uses Supabase Auth
 */
export async function GET(request: NextRequest) {
    try {
        // Use Supabase auth for admin
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || undefined
        const status = searchParams.get('status') || undefined
        const paymentStatus = searchParams.get('paymentStatus') || undefined
        const dateFrom = searchParams.get('dateFrom') || undefined
        const dateTo = searchParams.get('dateTo') || undefined
        const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20

        const result = await fetchOrders({
            search,
            status,
            paymentStatus,
            dateFrom,
            dateTo,
            page,
            limit
        })

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            orders: result.orders,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        })
    } catch (error: any) {
        console.error('Error fetching orders:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch orders' },
            { status: 500 }
        )
    }
}

