import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getLowStockProducts, updateProductInventory } from '@/lib/actions/products'
import { updateVariantInventory } from '@/lib/actions/product-variants'

/**
 * GET /api/admin/inventory - Get inventory status
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role verification

    const { searchParams } = new URL(request.url)
    const threshold = searchParams.get('threshold')
      ? parseInt(searchParams.get('threshold')!)
      : 10

    const result = await getLowStockProducts(threshold)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products: result.products,
      threshold,
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

    // TODO: Add admin role verification

    const { productId, variantId, quantity, operation } = await request.json()

    if (!quantity || quantity < 0) {
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
      result = await updateProductInventory(productId, quantity, operation || 'set')
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      item: variantId ? result.variant : result.product,
    })
  } catch (error: any) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update inventory' },
      { status: 500 }
    )
  }
}
