import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { updateProductInventory } from '@/lib/actions/products'
import { updateVariantInventory } from '@/lib/actions/product-variants'

/**
 * GET /api/admin/inventory - Get inventory items with filters
 * Returns inventory data with product/variant details
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stockStatus = searchParams.get('stockStatus') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createAdminClient()

    // Build query for inventory items with product/variant info
    let query = supabase
      .from('inventory_items')
      .select(`
        id,
        variant_id,
        quantity,
        reserved,
        available_quantity,
        low_stock_threshold,
        last_restock_at,
        created_at,
        updated_at,
        product_variants!inner (
          id,
          sku,
          name,
          price,
          product_id,
          products!inner (
            id,
            name,
            thumbnail,
            allow_backorders
          )
        )
      `, { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // Apply stock status filter
    if (stockStatus === 'out_of_stock') {
      query = query.eq('quantity', 0)
    } else if (stockStatus === 'low_stock') {
      query = query.gt('quantity', 0).lte('quantity', 10) // Default low stock threshold
    } else if (stockStatus === 'in_stock') {
      query = query.gt('quantity', 10)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching inventory:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match InventoryItem interface
    const inventory = (data || []).map((item: any) => {
      const variant = item.product_variants
      const product = variant?.products

      return {
        id: item.id,
        variant_id: item.variant_id,
        product_name: product?.name || 'Unknown Product',
        variant_name: variant?.name || null,
        sku: variant?.sku || null,
        quantity: item.quantity || 0,
        low_stock_threshold: item.low_stock_threshold || 10,
        track_quantity: true,
        allow_backorders: product?.allow_backorders || false,
        available_quantity: item.available_quantity || item.quantity || 0,
        reserved_quantity: item.reserved || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
        thumbnail: product?.thumbnail || null,
        price: variant?.price || 0
      }
    })

    // Apply search filter (client-side for now, could optimize with DB)
    let filteredInventory = inventory
    if (search) {
      const searchLower = search.toLowerCase()
      filteredInventory = inventory.filter((item: any) =>
        item.product_name?.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower) ||
        item.variant_name?.toLowerCase().includes(searchLower)
      )
    }

    // Debug logging
    console.log('[Inventory API] Returning:', {
      inventoryCount: filteredInventory.length,
      total: count,
      page,
      limit,
      sampleItem: filteredInventory[0] ? {
        id: filteredInventory[0].id,
        product_name: filteredInventory[0].product_name,
        quantity: filteredInventory[0].quantity
      } : null
    })

    return NextResponse.json({
      success: true,
      inventory: filteredInventory,
      total: count || filteredInventory.length,
      page,
      limit
    })
  } catch (error: any) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/inventory - Update inventory
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, variantId, quantity, operation } = await request.json()

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      )
    }

    if (!productId && !variantId) {
      return NextResponse.json(
        { error: 'Either productId or variantId is required' },
        { status: 400 }
      )
    }

    let result

    if (variantId) {
      result = await updateVariantInventory(variantId, quantity, operation || 'set')
    } else {
      result = await updateProductInventory(productId, quantity)
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      item: variantId ? (result as any).variant : (result as any).product,
    })
  } catch (error: any) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update inventory' },
      { status: 500 }
    )
  }
}


