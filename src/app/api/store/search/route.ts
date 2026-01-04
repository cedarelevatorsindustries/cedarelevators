import { NextRequest, NextResponse } from 'next/server'
import { storeSearch } from '@/lib/actions/store-search'

/**
 * GET /api/store/search
 * 
 * Store-wide product search with full-text ranking
 * 
 * Query params:
 * - q: search query (required)
 * - category: category ID filter
 * - application: application ID filter
 * - type: elevator type ID filter
 * - page: page number (default: 1)
 * - limit: results per page (default: 24)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        const query = searchParams.get('q')
        if (!query) {
            return NextResponse.json(
                { error: 'Search query (q) is required' },
                { status: 400 }
            )
        }

        const filters = {
            query,
            category_id: searchParams.get('category') || undefined,
            application_id: searchParams.get('application') || undefined,
            elevator_type_id: searchParams.get('type') || undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 24
        }

        const result = await storeSearch(filters)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            products: result.products,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        })
    } catch (error: any) {
        console.error('Store search API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

