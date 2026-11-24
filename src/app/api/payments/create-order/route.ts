import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/payments/create-order
 * Phase 1 Scope: Online payments are deferred in favor of quotation/enquiry workflows.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Online payment processing is deferred in Phase 1. Please submit a quotation request via /quotes/new.'
    },
    { status: 403 }
  )
}
