import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/payments/verify
 * Phase 1 Scope: Online payments are deferred.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Online payment verification is deferred in Phase 1.'
    },
    { status: 403 }
  )
}
