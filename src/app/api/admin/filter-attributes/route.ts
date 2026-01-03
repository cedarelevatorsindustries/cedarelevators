/**
 * API route for managing filter attributes (Admin)
 * GET /api/admin/filter-attributes - List all attributes
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Check admin permission (implement your auth check here)
    // const user = await supabase.auth.getUser()
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    // }
    
    const { data: attributes, error } = await supabase
      .from('product_attributes')
      .select('*')
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

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    // Validate required fields
    if (!body.attribute_key || !body.display_name || !body.attribute_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const { data: attribute, error } = await supabase
      .from('product_attributes')
      .insert([
        {
          attribute_key: body.attribute_key,
          attribute_type: body.attribute_type,
          display_name: body.display_name,
          unit: body.unit || null,
          is_filterable: body.is_filterable !== undefined ? body.is_filterable : true,
          filter_priority: body.filter_priority || 0,
          options: body.options || null,
          min_value: body.min_value || null,
          max_value: body.max_value || null
        }
      ])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create attribute: ${error.message}`)
    }
    
    return NextResponse.json({
      success: true,
      data: attribute,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Create attribute error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create attribute',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
