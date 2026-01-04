import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  fetchProducts,
  bulkUpdateProductStatus,
  bulkDeleteProducts,
  createProduct,
} from '@/lib/actions/products'
import { ProductStatus } from '@/lib/types/products'
import { logger } from "@/lib/services/logger"

/**
 * GET /api/admin/products - Fetch products with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const data = await fetchProducts({
      search,
      category,
      status: status as ProductStatus,
    }, 1, limit)

    return NextResponse.json({
      success: true,
      products: data.products,
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
    })
  } catch (error: any) {
    logger.error('Error fetching products', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/products - Create new product
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check

    const body = await request.json()
    const result = await createProduct(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create product' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      product: result.data,
    })
  } catch (error: any) {
    logger.error('Error creating product', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/products - Bulk update products
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check

    const { productIds, status } = await request.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const result = await bulkUpdateProductStatus(productIds, status)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${productIds.length} products`,
    })
  } catch (error: any) {
    logger.error('Error bulk updating products', error)
    return NextResponse.json(
      { error: error.message || 'Failed to bulk update products' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/products - Bulk delete products
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check

    const { productIds } = await request.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      )
    }

    const result = await bulkDeleteProducts(productIds)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${productIds.length} products`,
    })
  } catch (error: any) {
    logger.error('Error bulk deleting products', error)
    return NextResponse.json(
      { error: error.message || 'Failed to bulk delete products' },
      { status: 500 }
    )
  }
}

