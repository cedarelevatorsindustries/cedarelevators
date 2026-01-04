/**
 * Store Filter Facets API
 * GET /api/store/filters/facets
 * 
 * Returns facet counts for all filter dimensions based on current filters
 * This allows the UI to show accurate counts for available filter options
 */

import { NextRequest, NextResponse } from 'next/server'
import { FilterService, parseFilterParams } from '@/lib/services/filterService'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse filter parameters from URL
    const filters = parseFilterParams(searchParams)

    // Create filter service
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client')
    }
    const filterService = new FilterService(supabase)

    // Get facet counts
    const facets = await filterService.getFacetCounts(filters)

    return NextResponse.json({
      success: true,
      data: facets,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Facets API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch facets',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
