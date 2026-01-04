/**
 * Web Vitals API Route
 * Collects and stores performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, value, rating, id, timestamp, url } = body

    // In production, you would store this in a database or analytics service
    // For now, just log it
    console.log('[Web Vital]', {
      name,
      value: Math.round(value),
      rating,
      url,
      timestamp,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Web vitals error:', error)
    return NextResponse.json(
      { error: 'Failed to record metric' },
      { status: 500 }
    )
  }
}

