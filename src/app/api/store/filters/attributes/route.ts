/**
 * Store Filter Attributes API
 * GET /api/store/filters/attributes
 * 
 * Returns all filterable product attributes from the database
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: attributes, error } = await supabase
      .from('product_attributes')
      .select('*')
      .eq('is_filterable', true)
      .order('filter_priority', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to fetch attributes: ${error.message}`)
    }
    
    return NextResponse.json({
      success: true,
      data: attributes || [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Attributes API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch attributes',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
