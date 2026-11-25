import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getVerifiedGuestSession, normalizeEmail } from '@/lib/auth/guest-quote-auth'
import { getCustomerStatusInfo, isIssuedQuoteStatus } from '@/lib/quote-state-machine'

export async function GET(request: NextRequest) {
  try {
    const session = await getVerifiedGuestSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Verification required' }, { status: 401 })
    }

    const statusParam = request.nextUrl.searchParams.get('status') || 'all'
    const sortParam = request.nextUrl.searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest'
    const pageParam = parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
    const page = !isNaN(pageParam) && pageParam >= 1 ? pageParam : 1
    const pageSize = 20

    const supabase = createAdminClient()
    const emailNorm = normalizeEmail(session.email)

    let query = supabase
      .from('quotes')
      .select(
        `
        id, quote_number, status, request_type, company_name, created_at,
        issued_at, valid_until, current_revision, estimated_total, currency,
        requester_email, guest_email,
        items:quote_items(id, product_name, quantity)
      `,
        { count: 'exact' }
      )
      .or(`requester_email.ilike.${emailNorm},guest_email.ilike.${emailNorm}`)
      .order('created_at', { ascending: sortParam === 'oldest' })

    if (statusParam !== 'all') {
      if (statusParam === 'quoted') {
        query = query.in('status', ['quoted', 'approved'])
      } else if (statusParam === 'submitted') {
        query = query.in('status', ['submitted', 'pending'])
      } else {
        query = query.eq('status', statusParam)
      }
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: rows, count, error } = await query.range(from, to)
    if (error) {
      console.error('[GuestHistory] Query error:', error)
      return NextResponse.json({ success: false, error: 'Failed to load quotation history' }, { status: 500 })
    }

    // Sanitize: never expose pricing before issuance!
    const quotes = (rows || []).map((q: any) => {
      const issued = isIssuedQuoteStatus(q.status) || (q.status === 'expired' && (q.current_revision || 0) > 0)
      const statusInfo = getCustomerStatusInfo(q.status)
      const items = q.items || []
      const summaryText =
        items.length > 0
          ? items.slice(0, 2).map((i: any) => `${i.product_name} (x${i.quantity})`).join(', ') +
            (items.length > 2 ? ` +${items.length - 2} more` : '')
          : 'General Elevator / Project Enquiry'

      return {
        id: q.id,
        quote_number: q.quote_number,
        submitted_at: q.created_at,
        company_name: q.company_name || null,
        items_count: items.length,
        summary: summaryText,
        request_type: q.request_type || (items.length >= 2 ? 'bulk' : items.length === 1 ? 'single' : 'general'),
        status: q.status,
        customer_status: statusInfo,
        is_issued: issued,
        quoted_total: issued ? Number(q.estimated_total || 0) : null,
        currency: q.currency || 'INR',
        valid_until: issued ? q.valid_until : null,
        can_download_pdf: issued,
      }
    })

    const total = count || 0
    return NextResponse.json({
      success: true,
      email: emailNorm,
      quotes,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      sort: sortParam,
    })
  } catch (err: any) {
    console.error('[GuestHistory] Error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 })
  }
}
