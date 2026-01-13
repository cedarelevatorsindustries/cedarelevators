import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/inventory/low-stock - Get low stock alerts
 */
export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createAdminClient()

        // Get inventory items that are at or below their low stock threshold
        const { data, error } = await supabase
            .from('inventory_items')
            .select(`
        id,
        variant_id,
        quantity,
        low_stock_threshold,
        product_variants!inner (
          id,
          sku,
          name,
          price,
          products!inner (
            id,
            name,
            thumbnail
          )
        )
      `)
            .gt('quantity', 0) // Has some stock but low
            .order('quantity', { ascending: true })
            .limit(20)

        if (error) {
            console.error('Error fetching low stock alerts:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Filter to items below their threshold
        const lowStockItems = (data || [])
            .filter((item: any) => item.quantity <= (item.low_stock_threshold || 10))
            .map((item: any) => {
                const variant = item.product_variants
                const product = variant?.products

                return {
                    id: item.id,
                    variant_id: item.variant_id,
                    product_name: product?.name || 'Unknown Product',
                    variant_name: variant?.name || null,
                    sku: variant?.sku || null,
                    current_stock: item.quantity,
                    threshold: item.low_stock_threshold || 10,
                    thumbnail: product?.thumbnail || null
                }
            })

        return NextResponse.json({
            success: true,
            items: lowStockItems
        })
    } catch (error: any) {
        console.error('Error fetching low stock alerts:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch low stock alerts' },
            { status: 500 }
        )
    }
}
