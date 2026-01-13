import { NextRequest, NextResponse } from 'next/server'
import { getSearchSuggestions } from '@/lib/actions/search'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '8', 10)

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] })
    }

    try {
        const suggestions = await getSearchSuggestions(query, limit)

        return NextResponse.json(
            { suggestions },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
                }
            }
        )
    } catch (error) {
        console.error('Search suggestions error:', error)
        return NextResponse.json(
            { suggestions: [], error: 'Failed to get suggestions' },
            { status: 500 }
        )
    }
}
