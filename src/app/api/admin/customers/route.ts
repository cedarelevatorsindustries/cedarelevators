import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase/server'

/**
 * GET /api/admin/customers - Fetch customers with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role verification

    const supabase = await createServerSupabase()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || undefined
    const user_type = searchParams.get('user_type') || undefined
    const verification_status = searchParams.get('verification_status') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    // Base query for customer_meta
    let query = supabase
      .from('customer_meta')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (user_type && user_type !== 'all') {
      query = query.eq('user_type', user_type)
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: customers, error, count } = await query

    if (error) {
      console.error('Error fetching customers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If filtering by business users, also fetch business profiles
    if (user_type === 'business') {
      const clerkUserIds = customers?.map(c => c.clerk_user_id) || []
      
      if (clerkUserIds.length > 0) {
        const { data: businessProfiles } = await supabase
          .from('business_profiles')
          .select('*')
          .in('clerk_user_id', clerkUserIds)

        // Merge business profile data with customer data
        const customersWithBusiness = customers?.map(customer => ({
          ...customer,
          business_profile: businessProfiles?.find(
            bp => bp.clerk_user_id === customer.clerk_user_id
          ),
        }))

        return NextResponse.json({
          success: true,
          customers: customersWithBusiness,
          total: count || 0,
        })
      }
    }

    return NextResponse.json({
      success: true,
      customers,
      total: count || 0,
    })
  } catch (error: any) {
    console.error('Error in customer admin endpoint:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/customers/[id] - Get single customer details
 */
export async function getCustomerDetails(clerkUserId: string) {
  try {
    const supabase = await createServerSupabase()

    // Get customer meta
    const { data: customer, error: customerError } = await supabase
      .from('customer_meta')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (customerError) {
      console.error('Error fetching customer:', customerError)
      return { success: false, error: customerError.message }
    }

    // Get orders
    const { data: orders, count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Calculate total spent
    const { data: paidOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('clerk_user_id', clerkUserId)
      .eq('payment_status', 'paid')

    const totalSpent = paidOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

    // Get business profile if business user
    let businessProfile = null
    if (customer.user_type === 'business') {
      const { data: bp } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single()

      businessProfile = bp
    }

    return {
      success: true,
      customer: {
        ...customer,
        business_profile: businessProfile,
        orders,
        order_count: orderCount || 0,
        total_spent: totalSpent,
      },
    }
  } catch (error: any) {
    console.error('Error in getCustomerDetails:', error)
    return { success: false, error: error.message || 'Failed to fetch customer details' }
  }
}

