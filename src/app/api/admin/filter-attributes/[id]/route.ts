/**
 * API route for managing individual filter attributes (Admin)
 * PUT /api/admin/filter-attributes/[id] - Update attribute
 * DELETE /api/admin/filter-attributes/[id] - Delete attribute
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { id } = params
    
    // Build update object
    const updates: any = {}
    if (body.attribute_type !== undefined) updates.attribute_type = body.attribute_type
    if (body.display_name !== undefined) updates.display_name = body.display_name
    if (body.unit !== undefined) updates.unit = body.unit
    if (body.is_filterable !== undefined) updates.is_filterable = body.is_filterable
    if (body.filter_priority !== undefined) updates.filter_priority = body.filter_priority
    if (body.options !== undefined) updates.options = body.options
    if (body.min_value !== undefined) updates.min_value = body.min_value
    if (body.max_value !== undefined) updates.max_value = body.max_value
    updates.updated_at = new Date().toISOString()
    
    const { data: attribute, error } = await supabase
      .from('product_attributes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update attribute: ${error.message}`)
    }
    
    return NextResponse.json({
      success: true,
      data: attribute,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Update attribute error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update attribute',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    
    const { error } = await supabase
      .from('product_attributes')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new Error(`Failed to delete attribute: ${error.message}`)
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Delete attribute error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete attribute',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
