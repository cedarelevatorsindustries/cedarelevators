import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/inventory/stats - Get inventory statistics
 */
export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createAdminClient()

        // Get inventory items with variant prices for value calculation
        const { data: inventoryData, error } = await supabase
            .from('inventory_items')
            .select(`
        id,
        quantity,
        low_stock_threshold,
        product_variants!inner (
          price
        )
      `)

        if (error) {
            console.error('Error fetching inventory stats:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const items = inventoryData || []

        // Calculate stats
        const totalItems = items.length
        const inStock = items.filter((item: any) => item.quantity > (item.low_stock_threshold || 10)).length
        const lowStock = items.filter((item: any) =>
            item.quantity > 0 && item.quantity <= (item.low_stock_threshold || 10)
        ).length
        const outOfStock = items.filter((item: any) => item.quantity === 0).length

        // Calculate total inventory value
        const totalValue = items.reduce((sum: number, item: any) => {
            const price = item.product_variants?.price || 0
            return sum + (item.quantity * price)
        }, 0)

        return NextResponse.json({
            success: true,
            stats: {
                totalItems,
                inStock,
                lowStock,
                outOfStock,
                totalValue
            }
        })
    } catch (error: any) {
        console.error('Error fetching inventory stats:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch inventory stats' },
            { status: 500 }
        )
    }
}
