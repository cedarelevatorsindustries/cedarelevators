import { NextRequest, NextResponse } from 'next/server'
import { searchSuggestions } from '@/lib/actions/store-search'

/**
 * GET /api/store/search/suggestions
 * 
 * Fast autocomplete suggestions for search
 * 
 * Query params:
 * - q: search query (minimum 2 characters)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q') || ''

        if (query.length < 2) {
            return NextResponse.json({
                success: true,
                suggestions: { products: [], categories: [] }
            })
        }

        const result = await searchSuggestions(query)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Search suggestions API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

