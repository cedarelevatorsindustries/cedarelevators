/**
 * Store Filter Price Range API
 * GET /api/store/filters/price-range
 * 
 * Returns dynamic min/max price based on current filter scope
 */

import { NextRequest, NextResponse } from 'next/server'
import { FilterService, parseFilterParams } from '@/lib/services/filterService'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse filter parameters from URL
    const filters = parseFilterParams(searchParams)
    
    // Create filter service
    const supabase = createClient()
    const filterService = new FilterService(supabase)
    
    // Get price range
    const priceRange = await filterService.getPriceRange(filters)
    
    return NextResponse.json({
      success: true,
      data: priceRange,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Price range API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch price range',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
