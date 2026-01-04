/**
 * Store Products API with Filtering
 * GET /api/store/products
 * 
 * Query Parameters:
 * - category: string | string[] (comma-separated)
 * - application: string | string[]
 * - price_min: number
 * - price_max: number
 * - in_stock: boolean
 * - voltage: string | string[]
 * - load_capacity_min: number
 * - load_capacity_max: number
 * - speed_min: number
 * - speed_max: number
 * - rating_min: number
 * - sort: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'featured' | 'rating'
 * - page: number (default: 1)
 * - limit: number (default: 24)
 * - q: string (search query)
 * - include_facets: boolean (default: false, set to true for facet counts)
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

    // Check if facets should be included
    const includeFacets = searchParams.get('include_facets') === 'true'

    // Create filter service
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client')
    }
    const filterService = new FilterService(supabase)

    // Get filtered products
    const result = await filterService.getFilteredProducts(filters, includeFacets)

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Store products API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
